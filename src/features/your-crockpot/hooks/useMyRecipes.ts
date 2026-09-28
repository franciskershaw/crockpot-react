import { useAuth } from "@/features/auth/components/AuthContext";
import { listRecipes } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import { useApiInfiniteQuery } from "@/lib/tanstack/useApiInfiniteQuery";

// Divides evenly into the grid's 2-, 3- and 4-column layouts.
const PAGE_SIZE = 12;
const PARAMS = { mine: true, limit: PAGE_SIZE };

// Keyed under recipeKeys.lists() so favourite toggles and deletes patch it with every other list.
export function useMyRecipes() {
  const { isAuthenticated } = useAuth();
  return useApiInfiniteQuery({
    queryKey: recipeKeys.list(PARAMS),
    queryFn: (page) => listRecipes({ ...PARAMS, page }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: isAuthenticated,
  });
}
