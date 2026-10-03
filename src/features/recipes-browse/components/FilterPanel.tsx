import { Button } from "@/components/ui/button";
import type { Item, ItemCategory } from "@/features/catalog/data/types";
import { ingredientItems } from "@/features/catalog/utils/ingredientItems";
import type {
  CategoryMode,
  RecipeCategory,
  RecipeTimeRange,
} from "@/features/recipes/data/types";
import type { ApiError } from "@/lib/http/client";
import type { UseQueryResult } from "@tanstack/react-query";

import { CategoryFilter } from "./CategoryFilter";
import { FilterOptionListSkeleton } from "./FilterOptionListSkeleton";
import { IngredientFilter } from "./IngredientFilter";
import { TimeRangeSlider } from "./TimeRangeSlider";
import { TimeRangeSliderSkeleton } from "./TimeRangeSliderSkeleton";

function InlineRetry({
  label,
  onRetry,
}: {
  label: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>Couldn&apos;t load {label}.</span>
      <Button variant="ghost" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

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
  itemCategoriesQuery,
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
  itemCategoriesQuery: UseQueryResult<ItemCategory[], ApiError>;
  timeRangeQuery: UseQueryResult<RecipeTimeRange, ApiError>;
}) {
  return (
    <div className="flex flex-col gap-5.5">
      {timeRangeQuery.isError ? (
        <>
          <InlineRetry
            label="time range"
            onRetry={() => timeRangeQuery.refetch()}
          />
          <div className="h-px bg-card-shadow" />
        </>
      ) : timeRangeQuery.isPending ? (
        <>
          <TimeRangeSliderSkeleton />
          <div className="h-px bg-card-shadow" />
        </>
      ) : (
        timeRangeQuery.data && (
          <>
            <TimeRangeSlider
              bounds={timeRangeQuery.data}
              minTime={minTime}
              maxTime={maxTime}
              onChange={onSetTimeRange}
            />

            <div className="h-px bg-card-shadow" />
          </>
        )
      )}

      {categoriesQuery.isError ? (
        <InlineRetry
          label="categories"
          onRetry={() => categoriesQuery.refetch()}
        />
      ) : categoriesQuery.isPending ? (
        <FilterOptionListSkeleton label="Categories" />
      ) : (
        <CategoryFilter
          categories={categoriesQuery.data ?? []}
          selectedIds={categoryIds}
          mode={categoryMode}
          onToggle={onToggleCategory}
          onModeChange={onCategoryModeChange}
        />
      )}

      <div className="h-px bg-card-shadow" />

      {itemsQuery.isError ? (
        <InlineRetry label="ingredients" onRetry={() => itemsQuery.refetch()} />
      ) : itemsQuery.isPending || itemCategoriesQuery.isPending ? (
        <FilterOptionListSkeleton label="Ingredients" />
      ) : (
        <IngredientFilter
          items={ingredientItems(
            itemsQuery.data ?? [],
            itemCategoriesQuery.data ?? [],
          )}
          selectedIds={ingredientIds}
          onToggle={onToggleIngredient}
        />
      )}
    </div>
  );
}
