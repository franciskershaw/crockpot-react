import { CategoryFilter } from "./CategoryFilter";
import { IngredientFilter } from "./IngredientFilter";
import type { CategoryMode } from "./types";
import { useItems, useRecipeCategories } from "./useReferenceData";

export function FilterPanel({
  categoryIds,
  categoryMode,
  ingredientIds,
  onToggleCategory,
  onCategoryModeChange,
  onToggleIngredient,
}: {
  categoryIds: string[];
  categoryMode: CategoryMode;
  ingredientIds: string[];
  onToggleCategory: (id: string) => void;
  onCategoryModeChange: (mode: CategoryMode) => void;
  onToggleIngredient: (id: string) => void;
}) {
  const categoriesQuery = useRecipeCategories();
  const itemsQuery = useItems();

  return (
    <div className="flex flex-col gap-[22px]">
      <CategoryFilter
        categories={categoriesQuery.data ?? []}
        selectedIds={categoryIds}
        mode={categoryMode}
        onToggle={onToggleCategory}
        onModeChange={onCategoryModeChange}
      />

      <div className="h-px bg-card-shadow" />

      <IngredientFilter
        items={itemsQuery.data ?? []}
        selectedIds={ingredientIds}
        onToggle={onToggleIngredient}
      />
    </div>
  );
}
