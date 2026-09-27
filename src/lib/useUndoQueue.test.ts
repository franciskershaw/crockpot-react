import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UNDO_WINDOW_MS, useUndoQueue } from "./useUndoQueue";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const removal = (key: string) => ({
  key,
  item: `item ${key}`,
  anchorKey: null,
  index: 0,
});

function keys(result: { current: ReturnType<typeof useUndoQueue<string>> }) {
  return result.current.removals.map((r) => r.key);
}

describe("useUndoQueue", () => {
  it("keeps every removal, oldest first, unsettled and not undone", () => {
    const { result } = renderHook(() => useUndoQueue<string>());

    act(() => result.current.start(removal("a")));
    act(() => result.current.start(removal("b")));

    expect(keys(result)).toEqual(["a", "b"]);
    expect(result.current.removals[0]).toMatchObject({
      item: "item a",
      settled: false,
      undone: false,
    });
  });

  it("extends every removal's window when another is made, then clears them all together", () => {
    const { result } = renderHook(() => useUndoQueue<string>());

    act(() => result.current.start(removal("a")));
    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS - 1000));
    act(() => result.current.start(removal("b")));
    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS - 1));
    expect(keys(result)).toEqual(["a", "b"]);

    act(() => vi.advanceTimersByTime(1));
    expect(keys(result)).toEqual([]);
  });

  it("forgets one removal without touching the others", () => {
    const { result } = renderHook(() => useUndoQueue<string>());

    act(() => result.current.start(removal("a")));
    act(() => result.current.start(removal("b")));
    act(() => result.current.forget("a"));

    expect(keys(result)).toEqual(["b"]);
  });

  it("marks one removal settled or undone without touching the others", () => {
    const { result } = renderHook(() => useUndoQueue<string>());

    act(() => result.current.start(removal("a")));
    act(() => result.current.start(removal("b")));
    act(() => result.current.settle("a"));
    act(() => result.current.markUndone("b"));

    expect(
      result.current.removals.map(({ settled, undone }) => ({
        settled,
        undone,
      })),
    ).toEqual([
      { settled: true, undone: false },
      { settled: false, undone: true },
    ]);
  });

  it("replaces an earlier removal of the same item", () => {
    const { result } = renderHook(() => useUndoQueue<string>());

    act(() => result.current.start(removal("a")));
    act(() => result.current.markUndone("a"));
    act(() => result.current.start(removal("a")));

    expect(result.current.removals).toHaveLength(1);
    expect(result.current.removals[0].undone).toBe(false);
  });

  it("stops the window while paused, then carries on where it left off", () => {
    const { result } = renderHook(() => useUndoQueue<string>());

    act(() => result.current.start(removal("a")));
    act(() => vi.advanceTimersByTime(3000));
    act(() => result.current.pause());
    expect(result.current.paused).toBe(true);
    act(() => vi.advanceTimersByTime(60_000));
    expect(keys(result)).toEqual(["a"]);

    act(() => result.current.resume());
    expect(result.current.paused).toBe(false);
    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS - 3000 - 1));
    expect(keys(result)).toEqual(["a"]);
    act(() => vi.advanceTimersByTime(1));
    expect(keys(result)).toEqual([]);
  });

  it("stays paused until every pause has been released", () => {
    const { result } = renderHook(() => useUndoQueue<string>());

    act(() => result.current.start(removal("a")));
    act(() => result.current.pause());
    act(() => result.current.pause());
    act(() => result.current.resume());
    act(() => vi.advanceTimersByTime(60_000));

    expect(result.current.paused).toBe(true);
    expect(keys(result)).toEqual(["a"]);
  });

  it("gives a removal made while paused the full window once resumed", () => {
    const { result } = renderHook(() => useUndoQueue<string>());

    act(() => result.current.start(removal("a")));
    act(() => vi.advanceTimersByTime(4000));
    act(() => result.current.pause());
    act(() => result.current.start(removal("b")));
    act(() => result.current.resume());
    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS - 1));
    expect(keys(result)).toEqual(["a", "b"]);

    act(() => vi.advanceTimersByTime(1));
    expect(keys(result)).toEqual([]);
  });
});
