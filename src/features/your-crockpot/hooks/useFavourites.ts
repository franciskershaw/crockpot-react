import { useAuth } from "@/features/auth/components/AuthContext";
import { getFavourites } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import { useApiInfiniteQuery } from "@/lib/tanstack/useApiInfiniteQuery";

// Divides evenly into the grid's 2-, 3- and 4-column layouts.
const PAGE_SIZE = 12;

export function useFavourites() {
  const { isAuthenticated } = useAuth();

  return useApiInfiniteQuery({
    queryKey: recipeKeys.favourites(),
    queryFn: (page) => getFavourites(page, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: isAuthenticated,
  });
}
