import type { Item, Unit } from "../data/types";

// An item with no allowed units accepts any unit (mirrors the backend).
export function unitOptionsFor(item: Item, units: Unit[]): Unit[] {
  if (item.allowedUnitIds.length === 0) return units;
  const unitsById = new Map(units.map((unit) => [unit.id, unit]));
  return item.allowedUnitIds.flatMap((id) => {
    const unit = unitsById.get(id);
    return unit ? [unit] : [];
  });
}
