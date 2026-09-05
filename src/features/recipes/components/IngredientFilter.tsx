import type { Item } from "../types";
import { FilterOptionList } from "./FilterOptionList";

export function IngredientFilter({
  items,
  selectedIds,
  onToggle,
}: {
  items: Item[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <FilterOptionList
      label="Ingredients"
      options={items}
      selectedIds={selectedIds}
      onToggle={onToggle}
    />
  );
}
