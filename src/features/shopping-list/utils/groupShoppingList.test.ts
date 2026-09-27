import { buildShoppingListItem } from "@/test/shoppingListFixtures";
import { describe, expect, it } from "vitest";

import { groupShoppingList } from "./groupShoppingList";

const veg = { itemCategoryId: "ic_veg", itemCategoryName: "Veg" };
const dairy = { itemCategoryId: "ic_dairy", itemCategoryName: "Dairy" };

describe("groupShoppingList", () => {
  it("returns no groups and zero counts for an empty list", () => {
    expect(groupShoppingList([])).toEqual({
      groups: [],
      obtainedCount: 0,
      totalCount: 0,
    });
  });

  it("groups items by category, keeping the API's category and item order", () => {
    const result = groupShoppingList([
      buildShoppingListItem({ id: "a", ...dairy }),
      buildShoppingListItem({ id: "b", ...veg }),
      buildShoppingListItem({ id: "c", ...veg }),
    ]);

    expect(result.groups.map((g) => g.categoryName)).toEqual(["Dairy", "Veg"]);
    expect(result.groups[0].categoryId).toBe("ic_dairy");
    expect(result.groups[1].items.map((i) => i.id)).toEqual(["b", "c"]);
  });

  it("counts obtained and total items per category and overall", () => {
    const result = groupShoppingList([
      buildShoppingListItem({ id: "a", ...dairy, obtained: true }),
      buildShoppingListItem({ id: "b", ...veg, obtained: true }),
      buildShoppingListItem({ id: "c", ...veg }),
      buildShoppingListItem({ id: "d", ...veg }),
    ]);

    expect(result.groups[0]).toMatchObject({ obtainedCount: 1, totalCount: 1 });
    expect(result.groups[1]).toMatchObject({ obtainedCount: 1, totalCount: 3 });
    expect(result).toMatchObject({ obtainedCount: 2, totalCount: 4 });
  });
});
