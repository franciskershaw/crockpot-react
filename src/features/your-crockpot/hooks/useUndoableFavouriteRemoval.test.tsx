import { useToggleFavourite } from "@/features/recipes/hooks/useToggleFavourite";
import { UNDO_WINDOW_MS } from "@/lib/useUndoWindow";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useUndoableFavouriteRemoval } from "./useUndoableFavouriteRemoval";

vi.mock("@/features/recipes/hooks/useToggleFavourite", () => ({
  useToggleFavourite: vi.fn(),
}));

const toggle = { mutate: vi.fn(), isPending: false };

const recipe = (id: string) =>
  buildRecipeCard({ id, name: `Recipe ${id}`, isFavourite: true });

beforeEach(() => {
  toggle.isPending = false;
  vi.mocked(useToggleFavourite).mockReturnValue(
    toggle as unknown as ReturnType<typeof useToggleFavourite>,
  );
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("useUndoableFavouriteRemoval", () => {
  it("un-hearts the recipe and remembers it, with its position, for undo", () => {
    const { result } = renderHook(() => useUndoableFavouriteRemoval());

    act(() => result.current.remove(recipe("r_1"), 2));

    expect(toggle.mutate).toHaveBeenCalledWith(
      { recipeId: "r_1", wasFavourite: true },
      expect.anything(),
    );
    expect(result.current.removed).toEqual({ recipe: recipe("r_1"), index: 2 });
  });

  it("re-favourites the recipe into its old slot on undo", () => {
    const { result } = renderHook(() => useUndoableFavouriteRemoval());

    act(() => result.current.remove(recipe("r_1"), 2));
    act(() => result.current.undo());

    expect(toggle.mutate).toHaveBeenLastCalledWith({
      recipeId: "r_1",
      wasFavourite: false,
      restoreAt: { recipe: recipe("r_1"), index: 2 },
    });
    expect(result.current.removed?.undone).toBe(true);
    expect(result.current.canUndo).toBe(false);
  });

  it("forgets the removal once the undo window has passed", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useUndoableFavouriteRemoval());

    act(() => result.current.remove(recipe("r_1"), 0));
    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS - 1));
    expect(result.current.removed).not.toBeNull();

    act(() => vi.advanceTimersByTime(1));
    expect(result.current.removed).toBeNull();
  });

  it("restarts the undo window for a second removal, replacing the first", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useUndoableFavouriteRemoval());

    act(() => result.current.remove(recipe("r_1"), 0));
    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS - 1000));
    act(() => result.current.remove(recipe("r_2"), 1));
    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS - 1));

    expect(result.current.removed).toEqual({ recipe: recipe("r_2"), index: 1 });
  });

  it("forgets the removal if it fails, since the recipe comes back", () => {
    const { result } = renderHook(() => useUndoableFavouriteRemoval());

    act(() => result.current.remove(recipe("r_1"), 0));
    expect(toggle.mutate).toHaveBeenCalledTimes(1);
    const [, callbacks] = toggle.mutate.mock.calls[0];
    act(() => callbacks.onError());

    expect(result.current.removed).toBeNull();
  });

  it("holds off undo until the removal has gone through", () => {
    toggle.isPending = true;
    const { result } = renderHook(() => useUndoableFavouriteRemoval());

    act(() => result.current.remove(recipe("r_1"), 0));

    expect(result.current.removed).not.toBeNull();
    expect(result.current.canUndo).toBe(false);
  });

  it("allows undo once the removal has gone through", () => {
    const { result } = renderHook(() => useUndoableFavouriteRemoval());

    act(() => result.current.remove(recipe("r_1"), 0));

    expect(result.current.canUndo).toBe(true);
  });
});
