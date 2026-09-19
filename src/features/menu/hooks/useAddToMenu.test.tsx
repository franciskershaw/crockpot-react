import type { ReactNode } from "react";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { addMenuEntry } from "../data/api";
import { menuKeys } from "../data/queryKeys";
import type { Menu } from "../data/types";
import { useAddToMenu } from "./useAddToMenu";

vi.mock("../data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/api")>()),
  addMenuEntry: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockAddMenuEntry = vi.mocked(addMenuEntry);

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

describe("useAddToMenu", () => {
  it("optimistically adds the entry to the menu cache before the request resolves", async () => {
    const { queryClient, wrapper } = setup({ entries: [] });
    let resolveAdd: (v: { message: string }) => void;
    mockAddMenuEntry.mockReturnValue(
      new Promise((resolve) => {
        resolveAdd = resolve;
      }),
    );

    const { result } = renderHook(() => useAddToMenu(), { wrapper });

    result.current.mutate({ recipe: buildRecipeCard(), serves: 6 });

    await waitFor(() => {
      const data = queryClient.getQueryData<Menu>(menuKeys.menu());
      expect(data?.entries).toHaveLength(1);
      expect(data?.entries[0]).toMatchObject({ recipeId: "r_1", serves: 6 });
    });

    expect(mockAddMenuEntry).toHaveBeenCalledWith("r_1", 6);
    resolveAdd!({ message: "ok" });
  });

  it("replaces an existing entry for the same recipe rather than duplicating it", async () => {
    const { queryClient, wrapper } = setup({
      entries: [{ recipeId: "r_1", serves: 4, recipe: buildRecipeCard() }],
    });
    mockAddMenuEntry.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useAddToMenu(), { wrapper });

    result.current.mutate({ recipe: buildRecipeCard(), serves: 8 });

    await waitFor(() => {
      const data = queryClient.getQueryData<Menu>(menuKeys.menu());
      expect(data?.entries).toHaveLength(1);
      expect(data?.entries[0].serves).toBe(8);
    });
  });

  it("rolls back to the previous menu when the request fails", async () => {
    const { queryClient, wrapper } = setup({ entries: [] });
    mockAddMenuEntry.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useAddToMenu(), { wrapper });

    result.current.mutate({ recipe: buildRecipeCard(), serves: 6 });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const data = queryClient.getQueryData<Menu>(menuKeys.menu());
    expect(data?.entries).toHaveLength(0);
  });
});
