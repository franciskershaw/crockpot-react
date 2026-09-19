import { listRecipes } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import type { RecipeListParams } from "@/features/recipes/data/types";
import { useApiInfiniteQuery } from "@/lib/tanstack/useApiInfiniteQuery";
import { keepPreviousData } from "@tanstack/react-query";

// Divides evenly into the grid's 1-, 2- and 3-column layouts.
const PAGE_SIZE = 12;

export function useRecipeList(params: RecipeListParams) {
  return useApiInfiniteQuery({
    queryKey: recipeKeys.list(params),
    queryFn: (page) => listRecipes({ ...params, page, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });
}
