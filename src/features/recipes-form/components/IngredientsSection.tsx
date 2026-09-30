import { useMemo, useState } from "react";
import { AddItemEditor } from "@/features/catalog/components/AddItemEditor";
import { AddItemSearch } from "@/features/catalog/components/AddItemSearch";
import type { Item } from "@/features/catalog/data/types";
import { useItemCategories } from "@/features/catalog/hooks/useItemCategories";
import { useItems } from "@/features/catalog/hooks/useItems";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { unitOptionsFor } from "@/features/catalog/utils/unitOptions";

import type { IngredientRow } from "../data/types";
import { FormSection } from "./FormSection";
import { IngredientListRow } from "./IngredientListRow";

export function IngredientsSection() {
  const { data: units } = useUnits();
  const { data: items } = useItems();
  const { data: categories } = useItemCategories();
  const [rows, setRows] = useState<IngredientRow[]>([]);
  const [picked, setPicked] = useState<Item | null>(null);
  const [returnFocus, setReturnFocus] = useState(false);

  const unitAbbreviations = useMemo(
    () => new Map(units?.map((unit) => [unit.id, unit.abbreviation])),
    [units],
  );
  const itemsById = useMemo(
    () => new Map(items?.map((item) => [item.id, item])),
    [items],
  );
  const categoryNames = useMemo(
    () => new Map(categories?.map((category) => [category.id, category.name])),
    [categories],
  );

  const unitOptionsForRow = (row: IngredientRow) => {
    const item = itemsById.get(row.itemId);
    return item ? unitOptionsFor(item, units ?? []) : (units ?? []);
  };

  const closeEditor = () => {
    setPicked(null);
    setReturnFocus(true);
  };

  const title = (
    <>
      Ingredients*
      {rows.length > 0 && (
        <span className="ml-2.5 inline-flex h-5.5 min-w-5.5 items-center justify-center rounded-full bg-chip px-1.5 align-middle font-sans text-xs font-bold text-ink-body">
          {rows.length}
        </span>
      )}
    </>
  );

  return (
    <FormSection title={title}>
      <p className="-mt-2 mb-4 text-[13px] text-muted-foreground">
        Search our list first — most common ingredients are already there and
        will total up correctly on shopping lists.
      </p>

      {picked ? (
        <div className="rounded-[7px] border-[1.5px] border-border bg-search-secondary px-3 py-1">
          <AddItemEditor
            item={picked}
            allowedUnits={unitOptionsFor(picked, units ?? [])}
            isPending={false}
            isError={false}
            confirmLabel="Add ingredient"
            onConfirm={(quantity, unitId) => {
              setRows([
                ...rows,
                {
                  itemId: picked.id,
                  itemName: picked.name,
                  itemCategoryName: categoryNames.get(picked.categoryId) ?? "",
                  unitId,
                  quantity: String(quantity),
                },
              ]);
              closeEditor();
            }}
            onCancel={closeEditor}
          />
        </div>
      ) : (
        <AddItemSearch
          variant="recipe"
          focusOnMount={returnFocus}
          onPick={setPicked}
        />
      )}

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No ingredients yet — search our list above.
        </p>
      ) : (
        <ul className="mt-2">
          {rows.map((row) => (
            <IngredientListRow
              key={row.itemId}
              row={row}
              unitOptions={unitOptionsForRow(row)}
              unitAbbreviation={
                row.unitId ? (unitAbbreviations.get(row.unitId) ?? null) : null
              }
              onChange={(changed) =>
                setRows(
                  rows.map((r) => (r.itemId === row.itemId ? changed : r)),
                )
              }
              onRemove={() =>
                setRows(rows.filter((r) => r.itemId !== row.itemId))
              }
            />
          ))}
        </ul>
      )}
    </FormSection>
  );
}
