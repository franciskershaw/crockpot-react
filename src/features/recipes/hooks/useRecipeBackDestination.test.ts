import { afterEach, describe, expect, it } from "vitest";

import {
  canGoBackInApp,
  resolveBackDestination,
} from "./useRecipeBackDestination";

describe("resolveBackDestination", () => {
  it("falls back to /recipes when from is null", () => {
    expect(resolveBackDestination(null)).toEqual({
      to: "/recipes",
      label: "Back to recipes",
    });
  });

  it("falls back to /recipes when from is undefined", () => {
    expect(resolveBackDestination(undefined)).toEqual({
      to: "/recipes",
      label: "Back to recipes",
    });
  });

  it("falls back to /recipes when from is blank", () => {
    expect(resolveBackDestination("   ")).toEqual({
      to: "/recipes",
      label: "Back to recipes",
    });
  });

  it("resolves the known /recipes label", () => {
    expect(resolveBackDestination("/recipes")).toEqual({
      to: "/recipes",
      label: "Back to recipes",
    });
  });

  it("trusts an unrecognized from for navigation but uses the generic label", () => {
    expect(resolveBackDestination("/menu")).toEqual({
      to: "/menu",
      label: "Back to recipes",
    });
  });

  it("trims whitespace around a real value", () => {
    expect(resolveBackDestination("  /recipes  ")).toEqual({
      to: "/recipes",
      label: "Back to recipes",
    });
  });
});

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
