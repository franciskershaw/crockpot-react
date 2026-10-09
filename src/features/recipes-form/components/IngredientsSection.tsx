import { lazy, Suspense, useState } from "react";
import { useAuth } from "@/features/auth/components/AuthContext";
import { isAdmin } from "@/features/auth/utils/isAdmin";
import { AddItemEditor } from "@/features/catalog/components/AddItemEditor";
import { AddItemSearch } from "@/features/catalog/components/AddItemSearch";
import type { Item } from "@/features/catalog/data/types";
import { useItemCategories } from "@/features/catalog/hooks/useItemCategories";
import { useItems } from "@/features/catalog/hooks/useItems";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { unitOptionsFor } from "@/features/catalog/utils/unitOptions";
import { byId } from "@/lib/byId";
import { useController, useFormState } from "react-hook-form";

import type { IngredientRow, RecipeFormValues } from "../data/types";
import { FieldError } from "./FieldError";
import { FormSection } from "./FormSection";
import { IngredientListRow } from "./IngredientListRow";

const CreateItemDialog = lazy(() =>
  import("@/features/catalog/components/CreateItemDialog").then((m) => ({
    default: m.CreateItemDialog,
  })),
);

export function IngredientsSection() {
  const { data: units } = useUnits();
  const { data: items } = useItems();
  const { data: categories } = useItemCategories();
  const {
    field: { value: rows, onChange: setRows, ref: searchRef },
    fieldState: { error },
  } = useController<RecipeFormValues, "ingredients">({ name: "ingredients" });
  const { errors } = useFormState<RecipeFormValues>({ name: "ingredients" });
  const [picked, setPicked] = useState<Item | null>(null);
  const [returnFocus, setReturnFocus] = useState(false);
  const [editSignals, setEditSignals] = useState<Record<string, number>>({});
  const [newItemName, setNewItemName] = useState<string | null>(null);
  const [resumeKey, setResumeKey] = useState(0);
  const { user } = useAuth();

  const unitsById = byId(units);
  const itemsById = byId(items);
  const categoriesById = byId(categories);

  const unitOptionsForRow = (row: IngredientRow) => {
    const item = itemsById.get(row.itemId);
    return item ? unitOptionsFor(item, unitsById) : (units ?? []);
  };

  const pickItem = (item: Item) => {
    if (rows.some((row) => row.itemId === item.id)) {
      setEditSignals((signals) => ({
        ...signals,
        [item.id]: (signals[item.id] ?? 0) + 1,
      }));
      return;
    }
    setPicked(item);
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
            allowedUnits={unitOptionsFor(picked, unitsById)}
            isPending={false}
            isError={false}
            confirmLabel="Add ingredient"
            onConfirm={(quantity, unitId) => {
              setRows([
                ...rows,
                {
                  itemId: picked.id,
                  itemName: picked.name,
                  itemCategoryName:
                    categoriesById.get(picked.categoryId)?.name ?? "",
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
          resumeKey={resumeKey}
          onCreate={isAdmin(user) ? setNewItemName : undefined}
          onPick={pickItem}
          inputRef={searchRef}
        />
      )}
      <FieldError message={error?.message} />

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No ingredients yet — search our list above.
        </p>
      ) : (
        <ul className="mt-2">
          {rows.map((row, index) => (
            <IngredientListRow
              key={row.itemId}
              row={row}
              error={errors.ingredients?.[index]?.quantity?.message}
              unitOptions={unitOptionsForRow(row)}
              editSignal={editSignals[row.itemId] ?? 0}
              unitAbbreviation={
                row.unitId
                  ? (unitsById.get(row.unitId)?.abbreviation ?? null)
                  : null
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
      {isAdmin(user) && (
        <Suspense fallback={null}>
          <CreateItemDialog
            open={newItemName !== null}
            initialName={newItemName ?? ""}
            ingredientsOnly
            onCreated={(item) => {
              setNewItemName(null);
              setPicked(item);
            }}
            onCancel={() => {
              setNewItemName(null);
              setResumeKey((key) => key + 1);
            }}
          />
        </Suspense>
      )}
    </FormSection>
  );
}
