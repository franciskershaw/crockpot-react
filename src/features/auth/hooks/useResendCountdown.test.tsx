import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useResendCountdown } from "./useResendCountdown";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useResendCountdown", () => {
  it("counts down from where it starts", () => {
    const { result } = renderHook(() => useResendCountdown(60));
    expect(result.current).toMatchObject({ secondsLeft: 60, label: "1:00" });

    act(() => vi.advanceTimersByTime(13_000));

    expect(result.current).toMatchObject({ secondsLeft: 47, label: "0:47" });
  });

  it("stops at zero", () => {
    const { result } = renderHook(() => useResendCountdown(5));

    act(() => vi.advanceTimersByTime(9_000));

    expect(result.current).toMatchObject({ secondsLeft: 0, label: "0:00" });
  });

  it("restarts from a new number of seconds", () => {
    const { result } = renderHook(() => useResendCountdown(0));
    expect(result.current.secondsLeft).toBe(0);

    act(() => result.current.start(30));
    act(() => vi.advanceTimersByTime(25_000));

    expect(result.current).toMatchObject({ secondsLeft: 5, label: "0:05" });
  });
});
