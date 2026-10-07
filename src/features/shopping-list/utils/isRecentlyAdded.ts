import type { RecentlyAdded, ShoppingListItem } from "../data/types";

export function isRecentlyAdded(
  item: ShoppingListItem,
  recentlyAdded: RecentlyAdded | null,
): boolean {
  return (
    recentlyAdded?.rows.some(
      (row) => row.itemId === item.itemId && row.unitId === item.unitId,
    ) ?? false
  );
}
