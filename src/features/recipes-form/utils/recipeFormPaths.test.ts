import { describe, expect, it } from "vitest";

import { isRecipeFormPath } from "./recipeFormPaths";

describe("isRecipeFormPath", () => {
  it.each([
    ["/recipes/new", true],
    ["/recipes/r_1/edit", true],
    ["/recipes/r_1", false],
    ["/recipes", false],
    ["/recipes/r_1/edit/more", false],
  ])("%s → %s", (path, expected) => {
    expect(isRecipeFormPath(path)).toBe(expected);
  });
});
