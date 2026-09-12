import {
  Apple,
  Archive,
  Beef,
  Carrot,
  Fish,
  Leaf,
  Package,
} from "lucide-react";
import { describe, expect, it } from "vitest";

import {
  getCategoryIcon,
  groupIngredientsByCategory,
} from "./ingredientCategories";
import type { HydratedIngredient } from "./types";

function ingredient(
  overrides: Partial<HydratedIngredient> = {},
): HydratedIngredient {
  return {
    itemId: "i_1",
    itemName: "Onion",
    itemCategoryId: "c_1",
    itemCategoryName: "Veg",
    unitId: null,
    unitAbbreviation: null,
    quantity: 1,
    ...overrides,
  };
}

describe("getCategoryIcon", () => {
  it("maps a known seeded category name to its icon", () => {
    expect(getCategoryIcon("Veg")).toBe(Carrot);
    expect(getCategoryIcon("Meat")).toBe(Beef);
    expect(getCategoryIcon("Fish")).toBe(Fish);
    expect(getCategoryIcon("Fruit")).toBe(Apple);
    expect(getCategoryIcon("Cupboard")).toBe(Archive);
    expect(getCategoryIcon("Herbs and Spices")).toBe(Leaf);
  });

  it("falls back to Package for an unrecognized category name", () => {
    expect(getCategoryIcon("Some New Category")).toBe(Package);
  });
});

describe("groupIngredientsByCategory", () => {
  it("groups ingredients under their category name", () => {
    const grouped = groupIngredientsByCategory([
      ingredient({ itemName: "Onion", itemCategoryName: "Veg" }),
      ingredient({ itemName: "Beef shin", itemCategoryName: "Meat" }),
      ingredient({ itemName: "Carrot", itemCategoryName: "Veg" }),
    ]);

    expect(Object.keys(grouped)).toEqual(["Veg", "Meat"]);
    expect(grouped.Veg.map((i) => i.itemName)).toEqual(["Onion", "Carrot"]);
    expect(grouped.Meat.map((i) => i.itemName)).toEqual(["Beef shin"]);
  });

  it("preserves each category's first-seen order rather than sorting", () => {
    const grouped = groupIngredientsByCategory([
      ingredient({ itemCategoryName: "Cupboard" }),
      ingredient({ itemCategoryName: "Bakery" }),
      ingredient({ itemCategoryName: "Dairy" }),
    ]);

    expect(Object.keys(grouped)).toEqual(["Cupboard", "Bakery", "Dairy"]);
  });

  it("returns an empty object for no ingredients", () => {
    expect(groupIngredientsByCategory([])).toEqual({});
  });
});
