import { listRecipeCategories } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import { REFERENCE_DATA_STALE_TIME } from "@/lib/constants";
import { useApiQuery } from "@/lib/tanstack/useApiQuery";

export function useRecipeCategories() {
  return useApiQuery({
    queryKey: recipeKeys.categories,
    queryFn: listRecipeCategories,
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}
