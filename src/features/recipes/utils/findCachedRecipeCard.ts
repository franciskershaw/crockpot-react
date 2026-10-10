import { menuKeys } from "@/features/menu/data/queryKeys";
import type { Menu } from "@/features/menu/data/types";
import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import { recipeKeys } from "../data/queryKeys";
import type { RecipeCard, RecipeListResponse } from "../data/types";

export function findCachedRecipeCard(
  queryClient: QueryClient,
  id: string,
): RecipeCard | undefined {
  const lists = [
    ...queryClient.getQueriesData<InfiniteData<RecipeListResponse>>({
      queryKey: recipeKeys.lists(),
    }),
    ...queryClient.getQueriesData<InfiniteData<RecipeListResponse>>({
      queryKey: recipeKeys.favourites(),
    }),
  ];
  for (const [, data] of lists) {
    const card = data?.pages
      .flatMap((page) => page.recipes)
      .find((recipe) => recipe.id === id);
    if (card) return card;
  }
  return queryClient
    .getQueryData<Menu>(menuKeys.menu())
    ?.entries.find((entry) => entry.recipeId === id)?.recipe;
}
