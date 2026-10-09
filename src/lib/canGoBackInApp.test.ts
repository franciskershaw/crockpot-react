import { afterEach, describe, expect, it } from "vitest";

import { canGoBackInApp } from "./canGoBackInApp";

describe("canGoBackInApp", () => {
  afterEach(() => {
    // Reset the tab's history state so one test's pushState doesn't leak into the next.
    window.history.replaceState(null, "");
  });

  it("is false on a fresh load with no history state", () => {
    window.history.replaceState(null, "");

    expect(canGoBackInApp()).toBe(false);
  });

  it("is false when the router's own idx is still 0", () => {
    window.history.replaceState({ idx: 0 }, "");

    expect(canGoBackInApp()).toBe(false);
  });

  it("is true once the router has pushed at least one entry", () => {
    window.history.pushState({ idx: 1 }, "");

    expect(canGoBackInApp()).toBe(true);
  });
});
