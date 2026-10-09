import { listRecipes } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import type { RecipeListParams } from "@/features/recipes/data/types";
import { useApiInfiniteQuery } from "@/lib/tanstack/useApiInfiniteQuery";

// Keyed under recipeKeys.lists() so favourite toggles and deletes patch it with every other list.
export function useLibraryRecipes(params: RecipeListParams, enabled: boolean) {
  const query = useApiInfiniteQuery({
    queryKey: recipeKeys.list(params),
    queryFn: (page) => listRecipes({ ...params, page }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled,
  });

  const loadMore = () => {
    if (query.isFetching || !query.hasNextPage) return;
    query.fetchNextPage();
  };

  return { ...query, loadMore };
}
