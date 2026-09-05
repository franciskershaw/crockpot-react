import { CategoryFilter } from "./CategoryFilter";
import { IngredientFilter } from "./IngredientFilter";
import { TimeRangeSlider } from "./TimeRangeSlider";
import type { CategoryMode } from "./types";
import {
  useItems,
  useRecipeCategories,
  useRecipeTimeRange,
} from "./useReferenceData";

export function FilterPanel({
  categoryIds,
  categoryMode,
  ingredientIds,
  minTime,
  maxTime,
  onToggleCategory,
  onCategoryModeChange,
  onToggleIngredient,
  onSetTimeRange,
}: {
  categoryIds: string[];
  categoryMode: CategoryMode;
  ingredientIds: string[];
  minTime: number | undefined;
  maxTime: number | undefined;
  onToggleCategory: (id: string) => void;
  onCategoryModeChange: (mode: CategoryMode) => void;
  onToggleIngredient: (id: string) => void;
  onSetTimeRange: (minTime: number, maxTime: number) => void;
}) {
  const categoriesQuery = useRecipeCategories();
  const itemsQuery = useItems();
  const timeRangeQuery = useRecipeTimeRange();

  return (
    <div className="flex flex-col gap-[22px]">
      {timeRangeQuery.data && (
        <>
          <TimeRangeSlider
            bounds={timeRangeQuery.data}
            minTime={minTime}
            maxTime={maxTime}
            onChange={onSetTimeRange}
          />

          <div className="h-px bg-card-shadow" />
        </>
      )}

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
