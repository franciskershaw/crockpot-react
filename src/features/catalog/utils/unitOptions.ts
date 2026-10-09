import type { Item, Unit } from "../data/types";

// An item with no allowed units accepts any unit (mirrors the backend).
export function unitOptionsFor(
  item: Item,
  unitsById: Map<string, Unit>,
): Unit[] {
  if (item.allowedUnitIds.length === 0) return [...unitsById.values()];
  return item.allowedUnitIds.flatMap((id) => {
    const unit = unitsById.get(id);
    return unit ? [unit] : [];
  });
}
