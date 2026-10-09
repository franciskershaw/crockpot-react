import { describe, expect, it } from "vitest";

import { pickShowcaseRecipes, SHOWCASE_POOL } from "./showcaseRecipes";

describe("pickShowcaseRecipes", () => {
  it("picks the requested number of different recipes from the pool", () => {
    const picked = pickShowcaseRecipes(5);

    expect(picked).toHaveLength(5);
    expect(new Set(picked.map((r) => r.name)).size).toBe(5);
    for (const recipe of picked) expect(SHOWCASE_POOL).toContain(recipe);
  });
});
