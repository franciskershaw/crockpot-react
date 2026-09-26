import type { ShoppingListItem } from "@/features/shopping-list/data/types";

export function buildShoppingListItem(
  overrides: Partial<ShoppingListItem> = {},
): ShoppingListItem {
  return {
    id: "sli_1",
    itemId: "i_1",
    itemName: "Onions",
    itemCategoryId: "ic_1",
    itemCategoryName: "Fruit & veg",
    unitId: null,
    unitAbbreviation: null,
    quantity: 2,
    obtained: false,
    isManual: false,
    ...overrides,
  };
}
