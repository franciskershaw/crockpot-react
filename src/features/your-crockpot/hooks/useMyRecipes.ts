import { useAuth } from "@/features/auth/components/AuthContext";
import { listRecipes } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import { useApiInfiniteQuery } from "@/lib/tanstack/useApiInfiniteQuery";

import { LIBRARY_PAGE_SIZE } from "../utils/libraryPageSize";

const PARAMS = { mine: true, limit: LIBRARY_PAGE_SIZE };

// Keyed under recipeKeys.lists() so favourite toggles and deletes patch it with every other list.
export function useMyRecipes() {
  const { isAuthenticated } = useAuth();
  const query = useApiInfiniteQuery({
    queryKey: recipeKeys.list(PARAMS),
    queryFn: (page) => listRecipes({ ...PARAMS, page }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: isAuthenticated,
  });

  const loadMore = () => {
    if (query.isFetching || !query.hasNextPage) return;
    query.fetchNextPage();
  };

  return { ...query, loadMore };
}
