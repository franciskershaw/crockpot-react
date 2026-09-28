import { useAuth } from "@/features/auth/components/AuthContext";
import { getFavourites } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import { useApiInfiniteQuery } from "@/lib/tanstack/useApiInfiniteQuery";
import { useIsMutating, useQueryClient } from "@tanstack/react-query";

import { LIBRARY_PAGE_SIZE } from "../utils/libraryPageSize";

export function useFavourites() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const changesInFlight = useIsMutating({
    mutationKey: recipeKeys.favouriteChange(),
  });

  const query = useApiInfiniteQuery({
    queryKey: recipeKeys.favourites(),
    queryFn: (page) => getFavourites(page, LIBRARY_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: isAuthenticated,
  });

  // A removal or undo shifts server offsets, so a stale list is refetched before paging on.
  const loadMore = () => {
    if (changesInFlight > 0 || query.isFetching) return;
    const stale = queryClient.getQueryState(
      recipeKeys.favourites(),
    )?.isInvalidated;
    if (stale) query.refetch();
    else if (query.hasNextPage) query.fetchNextPage();
  };

  return { ...query, changesInFlight, loadMore };
}
