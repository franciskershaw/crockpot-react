import { useToggleFavourite } from "@/features/recipes/hooks/useToggleFavourite";
import { deferred } from "@/test/queryClientTestUtils";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useUndoableFavouriteRemoval } from "./useUndoableFavouriteRemoval";

vi.mock("@/features/recipes/hooks/useToggleFavourite", () => ({
  useToggleFavourite: vi.fn(),
}));

const toggle = { mutate: vi.fn(), mutateAsync: vi.fn() };

const recipe = (id: string) =>
  buildRecipeCard({ id, name: `Recipe ${id}`, isFavourite: true });

beforeEach(() => {
  toggle.mutateAsync.mockResolvedValue({ message: "ok" });
  vi.mocked(useToggleFavourite).mockReturnValue(
    toggle as unknown as ReturnType<typeof useToggleFavourite>,
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useUndoableFavouriteRemoval", () => {
  it("un-hearts the recipe and remembers where it sat, for undo", async () => {
    const { result } = renderHook(() => useUndoableFavouriteRemoval());

    await act(() => result.current.remove(recipe("r_1"), "r_0", 2));

    expect(toggle.mutateAsync).toHaveBeenCalledWith({
      recipeId: "r_1",
      wasFavourite: true,
    });
    expect(result.current.removals).toEqual([
      expect.objectContaining({
        key: "r_1",
        item: recipe("r_1"),
        anchorKey: "r_0",
        index: 2,
      }),
    ]);
  });

  it("keeps every removal when several are made", async () => {
    const { result } = renderHook(() => useUndoableFavouriteRemoval());

    await act(() => result.current.remove(recipe("r_1"), null, 0));
    await act(() => result.current.remove(recipe("r_2"), null, 0));

    expect(result.current.removals.map((r) => r.key)).toEqual(["r_1", "r_2"]);
  });

  it("holds off undo on a removal until it has gone through", async () => {
    const removal = deferred<{ message: string }>();
    toggle.mutateAsync.mockReturnValue(removal.promise);
    const { result } = renderHook(() => useUndoableFavouriteRemoval());

    act(() => {
      result.current.remove(recipe("r_1"), null, 0);
    });
    expect(result.current.canUndo("r_1")).toBe(false);

    await act(async () => removal.resolve({ message: "ok" }));
    expect(result.current.canUndo("r_1")).toBe(true);
  });

  it("re-favourites a recipe into the given slot on undo, once", async () => {
    const { result } = renderHook(() => useUndoableFavouriteRemoval());
    await act(() => result.current.remove(recipe("r_1"), null, 0));

    act(() => result.current.undo("r_1", 1));
    act(() => result.current.undo("r_1", 1));

    expect(toggle.mutate).toHaveBeenCalledTimes(1);
    expect(toggle.mutate).toHaveBeenCalledWith({
      recipeId: "r_1",
      wasFavourite: false,
      restoreAt: { recipe: recipe("r_1"), index: 1 },
    });
    expect(result.current.canUndo("r_1")).toBe(false);
  });

  it("forgets only a removal that failed, since that recipe comes back", async () => {
    toggle.mutateAsync
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce({ message: "ok" });
    const { result } = renderHook(() => useUndoableFavouriteRemoval());

    await act(() => result.current.remove(recipe("r_1"), null, 0));
    await act(() => result.current.remove(recipe("r_2"), null, 0));

    expect(result.current.removals.map((r) => r.key)).toEqual(["r_2"]);
  });
});
