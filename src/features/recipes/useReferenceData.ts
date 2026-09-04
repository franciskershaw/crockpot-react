import { useApiQuery } from "@/lib/Tanstack/useApiQuery";

import { listItems, listRecipeCategories } from "./api";

// Admin-write-only reference data that changes rarely — cache long.
const REFERENCE_DATA_STALE_TIME = 1000 * 60 * 60;

export function useRecipeCategories() {
  return useApiQuery({
    queryKey: ["recipeCategories"],
    queryFn: listRecipeCategories,
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}

export function useItems() {
  return useApiQuery({
    queryKey: ["items"],
    queryFn: listItems,
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}
