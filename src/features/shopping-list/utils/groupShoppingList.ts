import type { ShoppingListItem } from "../data/types";

export interface ShoppingListCategoryGroup {
  categoryId: string;
  categoryName: string;
  items: ShoppingListItem[];
  obtainedCount: number;
  totalCount: number;
}

export interface GroupedShoppingList {
  groups: ShoppingListCategoryGroup[];
  obtainedCount: number;
  totalCount: number;
}

export function groupShoppingList(
  items: ShoppingListItem[],
): GroupedShoppingList {
  const groups = new Map<string, ShoppingListCategoryGroup>();
  let obtainedCount = 0;

  for (const item of items) {
    let group = groups.get(item.itemCategoryId);
    if (!group) {
      group = {
        categoryId: item.itemCategoryId,
        categoryName: item.itemCategoryName,
        items: [],
        obtainedCount: 0,
        totalCount: 0,
      };
      groups.set(item.itemCategoryId, group);
    }
    group.items.push(item);
    group.totalCount++;
    if (item.obtained) {
      group.obtainedCount++;
      obtainedCount++;
    }
  }

  return {
    groups: [...groups.values()],
    obtainedCount,
    totalCount: items.length,
  };
}
