import { describe, expect, it } from "vitest";

import type { Item, ItemCategory } from "../data/types";
import { ingredientItems } from "./ingredientItems";

function item(id: string, categoryId: string): Item {
  return { id, name: id, categoryId, allowedUnitIds: [] };
}

const categories: ItemCategory[] = [
  { id: "c_veg", name: "Veg", isIngredient: true },
  { id: "c_house", name: "House", isIngredient: false },
];

describe("ingredientItems", () => {
  it("drops items in a non-ingredient category, keeping order", () => {
    const items = [
      item("i_onion", "c_veg"),
      item("i_bin_bags", "c_house"),
      item("i_garlic", "c_veg"),
    ];

    expect(ingredientItems(items, categories).map((i) => i.id)).toEqual([
      "i_onion",
      "i_garlic",
    ]);
  });

  it("keeps items whose category it doesn't know, as the backend defaults to ingredient", () => {
    const items = [item("i_onion", "c_veg"), item("i_mystery", "c_unknown")];

    expect(ingredientItems(items, categories).map((i) => i.id)).toEqual([
      "i_onion",
      "i_mystery",
    ]);
  });
});
