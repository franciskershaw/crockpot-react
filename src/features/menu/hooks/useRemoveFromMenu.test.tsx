import type { ReactNode } from "react";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { removeMenuEntry } from "../data/api";
import { menuKeys } from "../data/queryKeys";
import type { Menu } from "../data/types";
import { useRemoveFromMenu } from "./useRemoveFromMenu";

vi.mock("../data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/api")>()),
  removeMenuEntry: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockRemoveMenuEntry = vi.mocked(removeMenuEntry);

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

describe("useRemoveFromMenu", () => {
  it("optimistically removes the entry from the menu cache before the request resolves", async () => {
    const { queryClient, wrapper } = setup({
      entries: [{ recipeId: "r_1", serves: 4, recipe: buildRecipeCard() }],
    });
    let resolveRemove: (v: { message: string }) => void;
    mockRemoveMenuEntry.mockReturnValue(
      new Promise((resolve) => {
        resolveRemove = resolve;
      }),
    );

    const { result } = renderHook(() => useRemoveFromMenu(), { wrapper });

    result.current.mutate({ recipeId: "r_1" });

    await waitFor(() => {
      const data = queryClient.getQueryData<Menu>(menuKeys.menu());
      expect(data?.entries).toHaveLength(0);
    });

    expect(mockRemoveMenuEntry).toHaveBeenCalledWith("r_1");
    resolveRemove!({ message: "ok" });
  });

  it("rolls back to the previous menu when the request fails", async () => {
    const { queryClient, wrapper } = setup({
      entries: [{ recipeId: "r_1", serves: 4, recipe: buildRecipeCard() }],
    });
    mockRemoveMenuEntry.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useRemoveFromMenu(), { wrapper });

    result.current.mutate({ recipeId: "r_1" });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const data = queryClient.getQueryData<Menu>(menuKeys.menu());
    expect(data?.entries).toHaveLength(1);
  });
});
