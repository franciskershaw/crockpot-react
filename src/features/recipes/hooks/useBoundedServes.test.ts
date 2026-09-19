import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useBoundedServes } from "./useBoundedServes";

describe("useBoundedServes", () => {
  it("starts at the default", () => {
    const { result } = renderHook(() => useBoundedServes(4));

    expect(result.current.serves).toBe(4);
  });

  it("adjust moves serves independently of the default", () => {
    const { result } = renderHook(() => useBoundedServes(4));

    act(() => result.current.adjust(1));
    expect(result.current.serves).toBe(5);

    act(() => result.current.adjust(-2));
    expect(result.current.serves).toBe(3);
  });

  it("applies several adjustments batched in one act", () => {
    const { result } = renderHook(() => useBoundedServes(4));

    act(() => {
      result.current.adjust(1);
      result.current.adjust(1);
    });

    expect(result.current.serves).toBe(6);
  });

  it("clamps at 1 and reports canDecrease false there", () => {
    const { result } = renderHook(() => useBoundedServes(1));

    expect(result.current.canDecrease).toBe(false);
    expect(result.current.canIncrease).toBe(true);

    act(() => result.current.adjust(-1));

    expect(result.current.serves).toBe(1);
  });

  it("clamps at 50 and reports canIncrease false there", () => {
    const { result } = renderHook(() => useBoundedServes(49));

    act(() => result.current.adjust(5));

    expect(result.current.serves).toBe(50);
    expect(result.current.canIncrease).toBe(false);
    expect(result.current.canDecrease).toBe(true);
  });

  it("reset drops a local adjustment back to the default", () => {
    const { result } = renderHook(() => useBoundedServes(4));

    act(() => result.current.adjust(3));
    act(() => result.current.reset());

    expect(result.current.serves).toBe(4);
  });

  it("drops a local adjustment once the default changes", () => {
    const { result, rerender } = renderHook(
      ({ defaultServes }) => useBoundedServes(defaultServes),
      { initialProps: { defaultServes: 4 } },
    );

    act(() => result.current.adjust(3));
    expect(result.current.serves).toBe(7);

    rerender({ defaultServes: 6 });

    expect(result.current.serves).toBe(6);
  });
});
