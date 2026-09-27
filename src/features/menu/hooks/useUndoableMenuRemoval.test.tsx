import { deferred } from "@/test/queryClientTestUtils";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MenuEntry } from "../data/types";
import { useAddToMenu } from "./useAddToMenu";
import { useRemoveFromMenu } from "./useRemoveFromMenu";
import { useUndoableMenuRemoval } from "./useUndoableMenuRemoval";

vi.mock("./useAddToMenu", () => ({ useAddToMenu: vi.fn() }));
vi.mock("./useRemoveFromMenu", () => ({ useRemoveFromMenu: vi.fn() }));

const addToMenu = { mutate: vi.fn() };
const removeFromMenu = { mutateAsync: vi.fn() };

function entry(id: string, serves = 6): MenuEntry {
  return {
    recipeId: id,
    serves,
    recipe: buildRecipeCard({ id, name: `Recipe ${id}` }),
  };
}

beforeEach(() => {
  removeFromMenu.mutateAsync.mockResolvedValue({ message: "ok" });
  vi.mocked(useAddToMenu).mockReturnValue(
    addToMenu as unknown as ReturnType<typeof useAddToMenu>,
  );
  vi.mocked(useRemoveFromMenu).mockReturnValue(
    removeFromMenu as unknown as ReturnType<typeof useRemoveFromMenu>,
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useUndoableMenuRemoval", () => {
  it("removes the recipe and remembers where it sat, for undo", async () => {
    const { result } = renderHook(() => useUndoableMenuRemoval());

    await act(() => result.current.remove(entry("r_1"), "r_0", 2));

    expect(removeFromMenu.mutateAsync).toHaveBeenCalledWith({
      recipeId: "r_1",
    });
    expect(result.current.removals).toEqual([
      expect.objectContaining({
        key: "r_1",
        item: entry("r_1"),
        anchorKey: "r_0",
        index: 2,
      }),
    ]);
  });

  it("keeps every removal when several are made", async () => {
    const { result } = renderHook(() => useUndoableMenuRemoval());

    await act(() => result.current.remove(entry("r_1"), null, 0));
    await act(() => result.current.remove(entry("r_2"), null, 0));

    expect(result.current.removals.map((r) => r.key)).toEqual(["r_1", "r_2"]);
  });

  it("holds off undo on a removal until it has gone through", async () => {
    const removal = deferred<{ message: string }>();
    removeFromMenu.mutateAsync.mockReturnValue(removal.promise);
    const { result } = renderHook(() => useUndoableMenuRemoval());

    act(() => {
      result.current.remove(entry("r_1"), null, 0);
    });
    expect(result.current.canUndo("r_1")).toBe(false);

    await act(async () => removal.resolve({ message: "ok" }));
    expect(result.current.canUndo("r_1")).toBe(true);
  });

  it("adds a recipe back at the given position and serves on undo, once", async () => {
    const { result } = renderHook(() => useUndoableMenuRemoval());
    await act(() => result.current.remove(entry("r_1", 6), null, 0));

    act(() => result.current.undo("r_1", 1));
    act(() => result.current.undo("r_1", 1));

    expect(addToMenu.mutate).toHaveBeenCalledTimes(1);
    expect(addToMenu.mutate).toHaveBeenCalledWith({
      recipe: entry("r_1").recipe,
      serves: 6,
      index: 1,
    });
    expect(result.current.canUndo("r_1")).toBe(false);
  });

  it("forgets only a removal that failed, since that recipe comes back", async () => {
    removeFromMenu.mutateAsync
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce({ message: "ok" });
    const { result } = renderHook(() => useUndoableMenuRemoval());

    await act(() => result.current.remove(entry("r_1"), null, 0));
    await act(() => result.current.remove(entry("r_2"), null, 0));

    expect(result.current.removals.map((r) => r.key)).toEqual(["r_2"]);
  });
});
