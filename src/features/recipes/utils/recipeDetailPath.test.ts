import { describe, expect, it } from "vitest";

import { recipeDetailPath } from "./recipeDetailPath";

describe("recipeDetailPath", () => {
  it("links to the recipe, carrying where it was opened from", () => {
    expect(recipeDetailPath("r_1", "/menu")).toBe("/recipes/r_1?from=%2Fmenu");
  });

  it("encodes a from that carries its own query string", () => {
    expect(recipeDetailPath("r_1", "/recipes?q=chicken&categoryId=c1")).toBe(
      "/recipes/r_1?from=%2Frecipes%3Fq%3Dchicken%26categoryId%3Dc1",
    );
  });
});
