import { useApiQuery } from "@/lib/tanstack/useApiQuery";

import { getRecipe } from "../data/api";
import { recipeKeys } from "../data/queryKeys";

export function useRecipe(id: string) {
  return useApiQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => getRecipe(id),
  });
}
