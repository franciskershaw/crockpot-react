import { buildRecipeCard } from "@/test/recipeFixtures";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MenuEntry } from "../data/types";
import { useAddToMenu } from "./useAddToMenu";
import { useRemoveFromMenu } from "./useRemoveFromMenu";
import {
  UNDO_WINDOW_MS,
  useUndoableMenuRemoval,
} from "./useUndoableMenuRemoval";

vi.mock("./useAddToMenu", () => ({ useAddToMenu: vi.fn() }));
vi.mock("./useRemoveFromMenu", () => ({ useRemoveFromMenu: vi.fn() }));

const addToMenu = { mutate: vi.fn(), isPending: false };
const removeFromMenu = { mutate: vi.fn(), isPending: false };

function entry(id: string, serves = 6): MenuEntry {
  return {
    recipeId: id,
    serves,
    recipe: buildRecipeCard({ id, name: `Recipe ${id}` }),
  };
}

beforeEach(() => {
  removeFromMenu.isPending = false;
  vi.mocked(useAddToMenu).mockReturnValue(
    addToMenu as unknown as ReturnType<typeof useAddToMenu>,
  );
  vi.mocked(useRemoveFromMenu).mockReturnValue(
    removeFromMenu as unknown as ReturnType<typeof useRemoveFromMenu>,
  );
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("useUndoableMenuRemoval", () => {
  it("removes the recipe and remembers it, with its position, for undo", () => {
    const { result } = renderHook(() => useUndoableMenuRemoval());

    act(() => result.current.remove(entry("r_1"), 2));

    expect(removeFromMenu.mutate).toHaveBeenCalledWith(
      { recipeId: "r_1" },
      expect.anything(),
    );
    expect(result.current.removed).toEqual({ entry: entry("r_1"), index: 2 });
  });

  it("adds the recipe back at its previous serves and position on undo", () => {
    const { result } = renderHook(() => useUndoableMenuRemoval());

    act(() => result.current.remove(entry("r_1", 6), 2));
    act(() => result.current.undo());

    expect(addToMenu.mutate).toHaveBeenCalledWith({
      recipe: entry("r_1").recipe,
      serves: 6,
      index: 2,
    });
    expect(result.current.removed).toBeNull();
  });

  it("forgets the removal once the undo window has passed", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useUndoableMenuRemoval());

    act(() => result.current.remove(entry("r_1"), 0));
    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS - 1));
    expect(result.current.removed).not.toBeNull();

    act(() => vi.advanceTimersByTime(1));
    expect(result.current.removed).toBeNull();
  });

  it("restarts the undo window for a second removal, replacing the first", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useUndoableMenuRemoval());

    act(() => result.current.remove(entry("r_1"), 0));
    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS - 1000));
    act(() => result.current.remove(entry("r_2"), 1));
    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS - 1));

    expect(result.current.removed).toEqual({ entry: entry("r_2"), index: 1 });
  });

  it("forgets the removal if it fails, since the recipe comes back", () => {
    const { result } = renderHook(() => useUndoableMenuRemoval());

    act(() => result.current.remove(entry("r_1"), 0));
    expect(removeFromMenu.mutate).toHaveBeenCalledTimes(1);
    const [, callbacks] = removeFromMenu.mutate.mock.calls[0];
    act(() => callbacks.onError());

    expect(result.current.removed).toBeNull();
  });

  it("holds off undo until the removal has gone through", () => {
    removeFromMenu.isPending = true;
    const { result } = renderHook(() => useUndoableMenuRemoval());

    act(() => result.current.remove(entry("r_1"), 0));

    expect(result.current.canUndo).toBe(false);
  });

  it("allows undo once the removal has gone through", () => {
    const { result } = renderHook(() => useUndoableMenuRemoval());

    act(() => result.current.remove(entry("r_1"), 0));

    expect(result.current.canUndo).toBe(true);
  });
});
