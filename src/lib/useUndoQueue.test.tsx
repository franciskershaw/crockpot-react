import { Activity, type ReactNode } from "react";
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

  it("counts each removal down on its own, so a later one never extends an earlier one", () => {
    const { result } = renderHook(() => useUndoQueue<string>());

    act(() => result.current.start(removal("a")));
    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS - 1000));
    act(() => result.current.start(removal("b")));
    act(() => vi.advanceTimersByTime(999));
    expect(keys(result)).toEqual(["a", "b"]);

    act(() => vi.advanceTimersByTime(1));
    expect(keys(result)).toEqual(["b"]);

    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS - 1001));
    expect(keys(result)).toEqual(["b"]);
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

  it("allows undo on a removal only once it has settled, and only once", () => {
    const { result } = renderHook(() => useUndoQueue<string>());

    act(() => result.current.start(removal("a")));
    act(() => result.current.start(removal("b")));
    expect(result.current.canUndo("a")).toBe(false);
    act(() => result.current.settle("a"));
    expect(result.current.canUndo("a")).toBe(true);
    expect(result.current.canUndo("b")).toBe(false);

    let claimed: unknown;
    act(() => {
      claimed = result.current.claimUndo("a");
    });
    expect(claimed).toMatchObject({ key: "a", item: "item a" });
    expect(result.current.canUndo("a")).toBe(false);

    act(() => {
      claimed = result.current.claimUndo("a");
    });
    expect(claimed).toBeUndefined();
  });

  it("won't undo a removal that hasn't settled", () => {
    const { result } = renderHook(() => useUndoQueue<string>());

    act(() => result.current.start(removal("a")));
    let claimed: unknown = "not called";
    act(() => {
      claimed = result.current.claimUndo("a");
    });

    expect(claimed).toBeUndefined();
    expect(result.current.removals[0].undone).toBe(false);
  });

  it("replaces an earlier removal of the same item", () => {
    const { result } = renderHook(() => useUndoQueue<string>());

    act(() => result.current.start(removal("a")));
    act(() => result.current.settle("a"));
    act(() => {
      result.current.claimUndo("a");
    });
    act(() => result.current.start(removal("a")));

    expect(result.current.removals).toHaveLength(1);
    expect(result.current.removals[0].undone).toBe(false);
  });

  it("pauses one removal without holding up the others", () => {
    const { result } = renderHook(() => useUndoQueue<string>());

    act(() => result.current.start(removal("a")));
    act(() => result.current.start(removal("b")));
    act(() => result.current.pause("a"));
    expect(result.current.isPaused("a")).toBe(true);
    expect(result.current.isPaused("b")).toBe(false);

    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS));
    expect(keys(result)).toEqual(["a"]);
  });

  it("carries on where it left off once resumed", () => {
    const { result } = renderHook(() => useUndoQueue<string>());

    act(() => result.current.start(removal("a")));
    act(() => vi.advanceTimersByTime(1000));
    act(() => result.current.pause("a"));
    act(() => vi.advanceTimersByTime(60_000));
    expect(keys(result)).toEqual(["a"]);

    act(() => result.current.resume("a"));
    expect(result.current.isPaused("a")).toBe(false);
    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS - 1000 - 1));
    expect(keys(result)).toEqual(["a"]);
    act(() => vi.advanceTimersByTime(1));
    expect(keys(result)).toEqual([]);
  });

  it("stays paused until every pause has been released", () => {
    const { result } = renderHook(() => useUndoQueue<string>());

    act(() => result.current.start(removal("a")));
    act(() => result.current.pause("a"));
    act(() => result.current.pause("a"));
    act(() => result.current.resume("a"));
    act(() => vi.advanceTimersByTime(60_000));

    expect(result.current.isPaused("a")).toBe(true);
    expect(keys(result)).toEqual(["a"]);
  });

  it("gives an item removed again a fresh window", () => {
    const { result } = renderHook(() => useUndoQueue<string>());

    act(() => result.current.start(removal("a")));
    act(() => result.current.settle("a"));
    act(() => {
      result.current.claimUndo("a");
    });
    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS - 1));
    act(() => result.current.start(removal("a")));
    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS - 1));
    expect(keys(result)).toEqual(["a"]);

    act(() => vi.advanceTimersByTime(1));
    expect(keys(result)).toEqual([]);
  });

  it("starts no timer once unmounted, even if a hold is let go on the way out", () => {
    const { result, unmount } = renderHook(() => useUndoQueue<string>());

    act(() => result.current.start(removal("a")));
    act(() => result.current.pause("a"));
    const { resume } = result.current;
    unmount();
    resume("a");

    expect(vi.getTimerCount()).toBe(0);
  });

  it("picks the countdown back up when shown again after being hidden", () => {
    let mode: "visible" | "hidden" = "visible";
    const { result, rerender } = renderHook(() => useUndoQueue<string>(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <Activity mode={mode}>{children}</Activity>
      ),
    });

    act(() => result.current.start(removal("a")));
    act(() => vi.advanceTimersByTime(1000));
    mode = "hidden";
    rerender();
    mode = "visible";
    rerender();
    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS - 1000 - 1));
    expect(keys(result)).toEqual(["a"]);

    act(() => vi.advanceTimersByTime(1));
    expect(keys(result)).toEqual([]);
  });
});
