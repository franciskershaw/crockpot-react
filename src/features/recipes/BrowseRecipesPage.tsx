import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal } from "lucide-react";

import { FilterPanel } from "./FilterPanel";
import { FilterPanelHeader } from "./FilterPanelHeader";
import { FilterPills } from "./FilterPills";
import { MobileFilterDrawer } from "./MobileFilterDrawer";
import { RecipeGrid } from "./RecipeGrid";
import { SearchBar } from "./SearchBar";
import { useRecipeFilters } from "./useRecipeFilters";
import { useRecipeList } from "./useRecipeList";
import { useItems, useRecipeCategories } from "./useReferenceData";

export function BrowseRecipesPage() {
  const {
    params,
    activeFilterCount,
    setQuery,
    toggleCategory,
    setCategoryMode,
    toggleIngredient,
    setTimeRange,
    clearAll,
  } = useRecipeFilters();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const categoriesQuery = useRecipeCategories();
  const itemsQuery = useItems();
  const { data } = useRecipeList(params);
  const total = data?.pages[0]?.total;
  const categoryMode = params.categoryMode ?? "include";

  const filterKey = JSON.stringify(params);
  const previousFilterKey = useRef(filterKey);
  useEffect(() => {
    if (previousFilterKey.current === filterKey) return;
    previousFilterKey.current = filterKey;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filterKey]);

  const pillsProps = {
    categoryIds: params.categoryIds ?? [],
    categoryMode,
    categories: categoriesQuery.data ?? [],
    ingredientIds: params.ingredientIds ?? [],
    ingredients: itemsQuery.data ?? [],
    minTime: params.minTime,
    maxTime: params.maxTime,
    onRemoveCategory: toggleCategory,
    onRemoveIngredient: toggleIngredient,
    onRemoveTimeRange: () => setTimeRange(undefined, undefined),
  };

  const filterPanelProps = {
    categoryIds: params.categoryIds ?? [],
    categoryMode,
    ingredientIds: params.ingredientIds ?? [],
    onToggleCategory: toggleCategory,
    onCategoryModeChange: setCategoryMode,
    onToggleIngredient: toggleIngredient,
  };

  return (
    <>
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="hidden items-center gap-4 py-3 md:flex">
            <div className="flex shrink-0 items-center gap-3">
              <h1 className="font-display text-4xl">Browse Recipes</h1>
              {total !== undefined && (
                <Badge variant="chip">{total} recipes</Badge>
              )}
            </div>
            <div className="flex flex-1 items-center gap-2.5 overflow-x-auto">
              <FilterPills {...pillsProps} />
            </div>
            <SearchBar
              value={params.q ?? ""}
              onChange={setQuery}
              className="w-[320px] shrink-0"
            />
          </div>

          <div className="flex flex-col gap-3 py-3 md:hidden">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-4xl">Browse Recipes</h1>
              {total !== undefined && (
                <Badge variant="chip">{total} recipes</Badge>
              )}
            </div>
            <SearchBar value={params.q ?? ""} onChange={setQuery} />
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-2.25 py-1.5 text-[13px] leading-none font-bold text-ink-secondary"
              >
                <SlidersHorizontal strokeWidth={2} className="size-3.5" />
                Filters ({activeFilterCount})
              </button>
              <FilterPills {...pillsProps} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 py-2">
        <div className="grid grid-cols-1 gap-7 md:grid-cols-[316px_1fr]">
          {/* top-[143px]/159px = site header (65px) + sticky title bar (70px) + this container's own py-2 top padding (8px), matching the recipe grid's own top edge; keep in sync if those change */}
          <aside className="sticky top-35.75 hidden max-h-[calc(100vh-159px)] flex-col overflow-hidden rounded-[10px] border border-border bg-card md:flex">
            <div className="shrink-0 p-5.5 pb-0">
              <FilterPanelHeader
                activeFilterCount={activeFilterCount}
                onClearAll={clearAll}
              />
              <div className="my-3 h-px bg-card-shadow" />
            </div>
            <div className="flex-1 overflow-y-auto p-5.5 pt-0">
              <FilterPanel {...filterPanelProps} />
            </div>
          </aside>

          <RecipeGrid
            params={params}
            activeFilterCount={activeFilterCount}
            onClearFilters={clearAll}
          />
        </div>
      </div>

      <MobileFilterDrawer
        open={mobileFiltersOpen}
        onOpenChange={setMobileFiltersOpen}
        header={
          <FilterPanelHeader
            activeFilterCount={activeFilterCount}
            onClearAll={clearAll}
          />
        }
      >
        <FilterPanel {...filterPanelProps} />
      </MobileFilterDrawer>
    </>
  );
}
