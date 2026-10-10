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

  it("falls back to /recipes for an unrecognized path", () => {
    expect(resolveBackDestination("/somewhere-else")).toEqual({
      to: "/recipes",
      label: "Back to recipes",
    });
  });

  it("keeps a known path's query string and uses its label", () => {
    expect(resolveBackDestination("/recipes?q=beef&page=2")).toEqual({
      to: "/recipes?q=beef&page=2",
      label: "Back to recipes",
    });
  });

  it("uses the label of a known path that carries a query string", () => {
    expect(resolveBackDestination("/menu?tab=week")).toEqual({
      to: "/menu?tab=week",
      label: "Back to menu",
    });
  });

  it("keeps a known path with a trailing slash and its query string", () => {
    expect(resolveBackDestination("/recipes/?q=beef")).toEqual({
      to: "/recipes/?q=beef",
      label: "Back to recipes",
    });
  });

  it("uses the label of a known path with a trailing slash", () => {
    expect(resolveBackDestination("/menu/")).toEqual({
      to: "/menu/",
      label: "Back to menu",
    });
  });

  it("falls back to /recipes for a known path with a trailing fragment", () => {
    expect(resolveBackDestination("/recipes#//evil.com")).toEqual({
      to: "/recipes",
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

  it("falls back to /recipes for a tab-smuggled protocol-relative from (open-redirect attempt)", () => {
    expect(resolveBackDestination("/\t/evil.com")).toEqual({
      to: "/recipes",
      label: "Back to recipes",
    });
  });

  it("falls back to /recipes for a newline-smuggled protocol-relative from (open-redirect attempt)", () => {
    expect(resolveBackDestination("/\n/evil.com")).toEqual({
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
