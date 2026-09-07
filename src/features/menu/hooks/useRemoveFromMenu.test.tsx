import type { ReactNode } from "react";
import type { RecipeCard } from "@/features/recipes/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { removeMenuEntry } from "../api";
import { menuKeys } from "../queryKeys";
import type { Menu } from "../types";
import { useRemoveFromMenu } from "./useRemoveFromMenu";

vi.mock("../api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api")>()),
  removeMenuEntry: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockRemoveMenuEntry = vi.mocked(removeMenuEntry);

afterEach(() => {
  vi.clearAllMocks();
});

function recipeCard(overrides: Partial<RecipeCard> = {}): RecipeCard {
  return {
    id: "r_1",
    name: "BBQ Pulled Pork",
    imageUrl: null,
    imageFilename: null,
    timeInMinutes: 30,
    serves: 4,
    approved: true,
    categories: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    isFavourite: false,
    ...overrides,
  };
}

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
      entries: [{ recipeId: "r_1", serves: 4, recipe: recipeCard() }],
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
      entries: [{ recipeId: "r_1", serves: 4, recipe: recipeCard() }],
    });
    mockRemoveMenuEntry.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useRemoveFromMenu(), { wrapper });

    result.current.mutate({ recipeId: "r_1" });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const data = queryClient.getQueryData<Menu>(menuKeys.menu());
    expect(data?.entries).toHaveLength(1);
  });
});
