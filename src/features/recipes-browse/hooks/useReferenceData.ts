import {
  getRecipeTimeRange,
  listRecipeCategories,
} from "@/features/recipes/data/api";
import { REFERENCE_DATA_STALE_TIME } from "@/lib/constants";
import { useApiQuery } from "@/lib/tanstack/useApiQuery";

export function useRecipeCategories() {
  return useApiQuery({
    queryKey: ["recipeCategories"],
    queryFn: listRecipeCategories,
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}

// No server-side cache on the backend for this aggregate — cache long
// here instead, same as the other reference data.
export function useRecipeTimeRange() {
  return useApiQuery({
    queryKey: ["recipeTimeRange"],
    queryFn: getRecipeTimeRange,
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}
