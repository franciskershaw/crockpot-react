import { describe, expect, it } from "vitest";

import type { Item, Unit } from "../data/types";
import { unitOptionsFor } from "./unitOptions";

const units: Unit[] = [
  { id: "u_g", name: "Grams", abbreviation: "g" },
  { id: "u_tbsp", name: "Tablespoon", abbreviation: "tbsp" },
  { id: "u_clove", name: "Clove", abbreviation: "cloves" },
];

function item(allowedUnitIds: string[]): Item {
  return { id: "i_1", name: "Garlic", categoryId: "c_veg", allowedUnitIds };
}

describe("unitOptionsFor", () => {
  it("offers the item's allowed units, in the item's order", () => {
    expect(
      unitOptionsFor(item(["u_clove", "u_g"]), units).map((u) => u.id),
    ).toEqual(["u_clove", "u_g"]);
  });

  it("skips allowed ids it has no unit for", () => {
    expect(
      unitOptionsFor(item(["u_missing", "u_g"]), units).map((u) => u.id),
    ).toEqual(["u_g"]);
  });

  it("offers every unit when the item allows any", () => {
    expect(unitOptionsFor(item([]), units)).toEqual(units);
  });
});
