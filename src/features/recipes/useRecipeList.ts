import { useApiInfiniteQuery } from "@/lib/Tanstack/useApiInfiniteQuery";
import { keepPreviousData } from "@tanstack/react-query";

import { listRecipes } from "./api";
import { recipeKeys } from "./queryKeys";
import type { RecipeListParams } from "./types";

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
