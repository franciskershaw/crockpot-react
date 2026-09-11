import { describe, expect, it } from "vitest";

import { resolveBackDestination } from "./useRecipeBackDestination";

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
