import type { HydratedIngredient } from "@/features/recipes/data/types";
import { describe, expect, it } from "vitest";

import { groupIngredientsByCategory } from "./ingredientCategories";

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
