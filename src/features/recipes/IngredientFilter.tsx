import { FilterOptionList } from "./FilterOptionList";
import type { Item } from "./types";

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
