import type { ApiError } from "@/lib/http/client";
import type { UseQueryResult } from "@tanstack/react-query";

import type {
  CategoryMode,
  Item,
  RecipeCategory,
  RecipeTimeRange,
} from "../types";
import { CategoryFilter } from "./CategoryFilter";
import { IngredientFilter } from "./IngredientFilter";
import { TimeRangeSlider } from "./TimeRangeSlider";

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
  categoriesQuery,
  itemsQuery,
  timeRangeQuery,
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
  categoriesQuery: UseQueryResult<RecipeCategory[], ApiError>;
  itemsQuery: UseQueryResult<Item[], ApiError>;
  timeRangeQuery: UseQueryResult<RecipeTimeRange, ApiError>;
}) {
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
