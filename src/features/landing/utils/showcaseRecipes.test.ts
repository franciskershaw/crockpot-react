import { describe, expect, it } from "vitest";

import {
  pickShowcaseRecipes,
  SHOWCASE_CARD_COUNT,
  SHOWCASE_POOL,
} from "./showcaseRecipes";

describe("pickShowcaseRecipes", () => {
  it("fills every card with a different recipe from the pool", () => {
    const picked = pickShowcaseRecipes();

    expect(picked).toHaveLength(SHOWCASE_CARD_COUNT);
    expect(new Set(picked.map((r) => r.name)).size).toBe(SHOWCASE_CARD_COUNT);
    for (const recipe of picked) expect(SHOWCASE_POOL).toContain(recipe);
  });
});
