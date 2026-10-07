import type { Regular, ShoppingListItem } from "../data/types";

const matchKey = (itemId: string, unitId: string | null) =>
  `${itemId}|${unitId ?? ""}`;

export function regularsOnList(
  regulars: Regular[],
  items: ShoppingListItem[],
): Set<string> {
  const unbought = new Set(
    items
      .filter((item) => !item.obtained)
      .map((item) => matchKey(item.itemId, item.unitId)),
  );
  return new Set(
    regulars
      .filter((regular) =>
        unbought.has(matchKey(regular.itemId, regular.unitId)),
      )
      .map((regular) => regular.id),
  );
}
