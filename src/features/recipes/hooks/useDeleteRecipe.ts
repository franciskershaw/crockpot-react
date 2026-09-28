import { menuKeys } from "@/features/menu/data/queryKeys";
import type { Menu } from "@/features/menu/data/types";
import { removeEntry } from "@/features/menu/utils/menuTransforms";
import { shoppingListKeys } from "@/features/shopping-list/data/queryKeys";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";

import { deleteRecipe } from "../data/api";
import { recipeKeys } from "../data/queryKeys";
import type { RecipeListData } from "../data/types";

const EVICT_FROM: QueryKey[] = [recipeKeys.lists(), recipeKeys.favourites()];

function evictRecipe(data: RecipeListData, recipeId: string): RecipeListData {
  const held = data.pages.some((page) =>
    page.recipes.some((recipe) => recipe.id === recipeId),
  );
  if (!held) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      total: page.total - 1,
      recipes: page.recipes.filter((recipe) => recipe.id !== recipeId),
    })),
  };
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useApiMutation<void, string, void>({
    mutationFn: (recipeId) => deleteRecipe(recipeId),
    onSuccess: (_data, recipeId) => {
      for (const queryKey of EVICT_FROM) {
        queryClient.setQueriesData<RecipeListData>({ queryKey }, (data) =>
          data ? evictRecipe(data, recipeId) : data,
        );
        // Server pages have shifted by one, so page on from a fresh fetch.
        queryClient.invalidateQueries({ queryKey });
      }
      queryClient.removeQueries({ queryKey: recipeKeys.detail(recipeId) });
      // The server cascades the recipe off every menu that held it.
      queryClient.setQueryData<Menu>(menuKeys.menu(), (data) =>
        removeEntry.apply(data, { recipeId }),
      );
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.list() });
    },
  });
}
