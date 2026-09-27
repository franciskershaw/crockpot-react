import { shoppingListKeys } from "@/features/shopping-list/data/queryKeys";
import { setupQueryClient } from "@/test/queryClientTestUtils";
import { buildRecipeCard } from "@/test/recipeFixtures";
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
  return setupQueryClient([[menuKeys.menu(), menu]]);
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

  it("marks the shopping list stale once the menu write succeeds", async () => {
    const { queryClient, wrapper } = setup({
      entries: [{ recipeId: "r_1", serves: 4, recipe: buildRecipeCard() }],
    });
    queryClient.setQueryData(shoppingListKeys.list(), { items: [] });
    mockUpdateMenuEntryServes.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useUpdateMenuEntryServes(), {
      wrapper,
    });
    result.current.mutate({ recipeId: "r_1", serves: 8 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      queryClient.getQueryState(shoppingListKeys.list())?.isInvalidated,
    ).toBe(true);
  });

  it("refetches the menu after a failure, so other changes aren't rolled back", async () => {
    const { queryClient, wrapper } = setup({
      entries: [{ recipeId: "r_1", serves: 4, recipe: buildRecipeCard() }],
    });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    mockUpdateMenuEntryServes.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useUpdateMenuEntryServes(), {
      wrapper,
    });
    result.current.mutate({ recipeId: "r_1", serves: 10 });

    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: menuKeys.menu() }),
    );
  });
});
