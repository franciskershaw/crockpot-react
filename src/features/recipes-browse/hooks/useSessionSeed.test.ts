import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSessionSeed } from "./useSessionSeed";

beforeEach(() => {
  sessionStorage.clear();
  vi.setSystemTime(new Date("2026-09-08T12:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useSessionSeed", () => {
  it("generates and persists a seed when none is stored", () => {
    const { result } = renderHook(() => useSessionSeed());

    expect(result.current).toEqual(expect.any(String));
    expect(result.current.length).toBeGreaterThan(0);
    expect(sessionStorage.getItem("recipe-browse-seed")).toBe(result.current);
  });

  it("returns the same seed across remounts on the same day", () => {
    const first = renderHook(() => useSessionSeed());
    const seed = first.result.current;
    first.unmount();

    const second = renderHook(() => useSessionSeed());

    expect(second.result.current).toBe(seed);
  });

  it("returns the same seed within a session even if Math.random changes", () => {
    const { result } = renderHook(() => useSessionSeed());
    const seed = result.current;

    const { result: secondResult } = renderHook(() => useSessionSeed());

    expect(secondResult.current).toBe(seed);
  });

  it("regenerates the seed once the stored date rolls over", () => {
    const first = renderHook(() => useSessionSeed());
    const yesterdaySeed = first.result.current;
    first.unmount();

    vi.setSystemTime(new Date("2026-09-09T12:00:00.000Z"));
    const second = renderHook(() => useSessionSeed());

    expect(second.result.current).not.toBe(yesterdaySeed);
    expect(sessionStorage.getItem("recipe-browse-seed-date")).toBe(
      new Date("2026-09-09T12:00:00.000Z").toDateString(),
    );
  });
});
