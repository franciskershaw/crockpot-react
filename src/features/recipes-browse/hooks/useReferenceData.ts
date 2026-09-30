import { getRecipeTimeRange } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import { REFERENCE_DATA_STALE_TIME } from "@/lib/constants";
import { useApiQuery } from "@/lib/tanstack/useApiQuery";

// No server-side cache on the backend for this aggregate — cache long
// here instead, same as the other reference data.
export function useRecipeTimeRange() {
  return useApiQuery({
    queryKey: recipeKeys.timeRange,
    queryFn: getRecipeTimeRange,
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}
