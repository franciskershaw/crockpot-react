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

  it("resolves the known /menu label", () => {
    expect(resolveBackDestination("/menu")).toEqual({
      to: "/menu",
      label: "Back to menu",
    });
  });

  it("resolves the known /library/favourites label", () => {
    expect(resolveBackDestination("/library/favourites")).toEqual({
      to: "/library/favourites",
      label: "Back to favourites",
    });
  });

  it("resolves the known /library/my-recipes label", () => {
    expect(resolveBackDestination("/library/my-recipes")).toEqual({
      to: "/library/my-recipes",
      label: "Back to my recipes",
    });
  });

  it("resolves the known /library/pending label", () => {
    expect(resolveBackDestination("/library/pending")).toEqual({
      to: "/library/pending",
      label: "Back to pending",
    });
  });

  it("trusts an unrecognized from for navigation but uses the generic label", () => {
    expect(resolveBackDestination("/somewhere-else")).toEqual({
      to: "/somewhere-else",
      label: "Back to recipes",
    });
  });

  it("trims whitespace around a real value", () => {
    expect(resolveBackDestination("  /recipes  ")).toEqual({
      to: "/recipes",
      label: "Back to recipes",
    });
  });

  it("falls back to /recipes for a protocol-relative from (open-redirect attempt)", () => {
    expect(resolveBackDestination("//evil.com")).toEqual({
      to: "/recipes",
      label: "Back to recipes",
    });
  });

  it("falls back to /recipes for an absolute-URL from (open-redirect attempt)", () => {
    expect(resolveBackDestination("https://evil.com")).toEqual({
      to: "/recipes",
      label: "Back to recipes",
    });
  });

  it("falls back to /recipes for a backslash-prefixed from (open-redirect attempt)", () => {
    expect(resolveBackDestination("/\\evil.com")).toEqual({
      to: "/recipes",
      label: "Back to recipes",
    });
  });

  it("falls back to /recipes for a from with no leading slash", () => {
    expect(resolveBackDestination("recipes")).toEqual({
      to: "/recipes",
      label: "Back to recipes",
    });
  });
});
