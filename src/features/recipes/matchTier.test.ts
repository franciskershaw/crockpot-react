import { describe, expect, it } from "vitest";

import { visibleMatchTier } from "./matchTier";

describe("visibleMatchTier", () => {
  it("returns null when the recipe has no tier", () => {
    expect(visibleMatchTier(null, 0, 0)).toBeNull();
    expect(visibleMatchTier(null, 3, 3)).toBeNull();
  });

  it("suppresses a tier when exactly one category is selected and no ingredients", () => {
    expect(visibleMatchTier("best", 0, 1)).toBeNull();
    expect(visibleMatchTier("good", 0, 1)).toBeNull();
  });

  it("does not suppress when 2+ categories are selected, even with no ingredients", () => {
    expect(visibleMatchTier("best", 0, 2)).toBe("best");
  });

  it("does not suppress a single selected ingredient with no categories", () => {
    expect(visibleMatchTier("good", 1, 0)).toBe("good");
  });

  it("does not suppress a single category when an ingredient is also selected", () => {
    expect(visibleMatchTier("best", 1, 1)).toBe("best");
  });
});
