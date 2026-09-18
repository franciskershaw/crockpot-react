import { listRecipes } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import type { RecipeListParams } from "@/features/recipes/data/types";
import { useApiInfiniteQuery } from "@/lib/tanstack/useApiInfiniteQuery";
import { keepPreviousData } from "@tanstack/react-query";

export function useRecipeList(params: RecipeListParams) {
  return useApiInfiniteQuery({
    queryKey: recipeKeys.list(params),
    queryFn: (page) => listRecipes({ ...params, page }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });
}
