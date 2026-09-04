import { useSearchParams } from "react-router-dom";

import type { CategoryMode, RecipeListParams } from "./types";

function parseParams(searchParams: URLSearchParams): RecipeListParams {
  const params: RecipeListParams = {};

  const q = searchParams.get("q");
  if (q) params.q = q;

  const categoryIds = searchParams.getAll("categoryId");
  if (categoryIds.length) params.categoryIds = categoryIds;

  const categoryMode = searchParams.get("categoryMode");
  if (categoryMode === "exclude") params.categoryMode = "exclude";

  const ingredientIds = searchParams.getAll("ingredientId");
  if (ingredientIds.length) params.ingredientIds = ingredientIds;

  const minTime = searchParams.get("minTime");
  if (minTime !== null) params.minTime = Number(minTime);

  const maxTime = searchParams.get("maxTime");
  if (maxTime !== null) params.maxTime = Number(maxTime);

  return params;
}

function countActiveFilters(params: RecipeListParams): number {
  return (
    (params.categoryIds?.length ?? 0) +
    (params.ingredientIds?.length ?? 0) +
    (params.minTime !== undefined || params.maxTime !== undefined ? 1 : 0)
  );
}

function toggleArrayParam(
  searchParams: URLSearchParams,
  key: string,
  id: string,
) {
  const ids = searchParams.getAll(key);
  searchParams.delete(key);
  const nextIds = ids.includes(id)
    ? ids.filter((existing) => existing !== id)
    : [...ids, id];
  for (const nextId of nextIds) searchParams.append(key, nextId);
}

export function useRecipeFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = parseParams(searchParams);

  function update(mutate: (next: URLSearchParams) => void) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        mutate(next);
        return next;
      },
      { replace: true },
    );
  }

  function setQuery(q: string) {
    update((next) => {
      if (q) next.set("q", q);
      else next.delete("q");
    });
  }

  function toggleCategory(id: string) {
    update((next) => toggleArrayParam(next, "categoryId", id));
  }

  function setCategoryMode(mode: CategoryMode) {
    update((next) => {
      if (mode === "exclude") next.set("categoryMode", "exclude");
      else next.delete("categoryMode");
    });
  }

  function toggleIngredient(id: string) {
    update((next) => toggleArrayParam(next, "ingredientId", id));
  }

  function setTimeRange(minTime?: number, maxTime?: number) {
    update((next) => {
      if (minTime !== undefined) next.set("minTime", String(minTime));
      else next.delete("minTime");
      if (maxTime !== undefined) next.set("maxTime", String(maxTime));
      else next.delete("maxTime");
    });
  }

  function clearAll() {
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  return {
    params,
    activeFilterCount: countActiveFilters(params),
    setQuery,
    toggleCategory,
    setCategoryMode,
    toggleIngredient,
    setTimeRange,
    clearAll,
  };
}
