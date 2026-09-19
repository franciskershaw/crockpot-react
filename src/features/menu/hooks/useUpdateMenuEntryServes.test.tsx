import type { ReactNode } from "react";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { updateMenuEntryServes } from "../data/api";
import { menuKeys } from "../data/queryKeys";
import type { Menu } from "../data/types";
import { useUpdateMenuEntryServes } from "./useUpdateMenuEntryServes";

vi.mock("../data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/api")>()),
  updateMenuEntryServes: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockUpdateMenuEntryServes = vi.mocked(updateMenuEntryServes);

afterEach(() => {
  vi.clearAllMocks();
});

function setup(menu: Menu) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  queryClient.setQueryData(menuKeys.menu(), menu);

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, wrapper };
}

describe("useUpdateMenuEntryServes", () => {
  it("optimistically patches the matching entry's serves before the request resolves", async () => {
    const { queryClient, wrapper } = setup({
      entries: [{ recipeId: "r_1", serves: 4, recipe: buildRecipeCard() }],
    });
    let resolveUpdate: (v: { message: string }) => void;
    mockUpdateMenuEntryServes.mockReturnValue(
      new Promise((resolve) => {
        resolveUpdate = resolve;
      }),
    );

    const { result } = renderHook(() => useUpdateMenuEntryServes(), {
      wrapper,
    });

    result.current.mutate({ recipeId: "r_1", serves: 10 });

    await waitFor(() => {
      const data = queryClient.getQueryData<Menu>(menuKeys.menu());
      expect(data?.entries[0].serves).toBe(10);
    });

    expect(mockUpdateMenuEntryServes).toHaveBeenCalledWith("r_1", 10);
    resolveUpdate!({ message: "ok" });
  });

  it("leaves other entries untouched", async () => {
    const { queryClient, wrapper } = setup({
      entries: [
        { recipeId: "r_1", serves: 4, recipe: buildRecipeCard() },
        {
          recipeId: "r_2",
          serves: 2,
          recipe: buildRecipeCard({ id: "r_2", name: "Veggie Chilli" }),
        },
      ],
    });
    mockUpdateMenuEntryServes.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useUpdateMenuEntryServes(), {
      wrapper,
    });

    result.current.mutate({ recipeId: "r_1", serves: 10 });

    await waitFor(() => {
      const data = queryClient.getQueryData<Menu>(menuKeys.menu());
      expect(data?.entries.find((e) => e.recipeId === "r_2")?.serves).toBe(2);
    });
  });

  it("rolls back to the previous serves when the request fails", async () => {
    const { queryClient, wrapper } = setup({
      entries: [{ recipeId: "r_1", serves: 4, recipe: buildRecipeCard() }],
    });
    mockUpdateMenuEntryServes.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useUpdateMenuEntryServes(), {
      wrapper,
    });

    result.current.mutate({ recipeId: "r_1", serves: 10 });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const data = queryClient.getQueryData<Menu>(menuKeys.menu());
    expect(data?.entries[0].serves).toBe(4);
  });
});
