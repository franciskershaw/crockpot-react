import { menuKeys } from "@/features/menu/data/queryKeys";
import type { Menu } from "@/features/menu/data/types";
import { removeEntry } from "@/features/menu/utils/menuTransforms";
import { shoppingListKeys } from "@/features/shopping-list/data/queryKeys";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { deleteRecipe } from "../data/api";
import { recipeKeys } from "../data/queryKeys";
import type { RecipeListData } from "../data/types";

const LIST_FILTER = { queryKey: recipeKeys.lists() };

function evictRecipe(data: RecipeListData, recipeId: string): RecipeListData {
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      recipes: page.recipes.filter((recipe) => recipe.id !== recipeId),
    })),
  };
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useApiMutation<void, string, void>({
    mutationFn: (recipeId) => deleteRecipe(recipeId),
    onSuccess: (_data, recipeId) => {
      queryClient.setQueriesData<RecipeListData>(LIST_FILTER, (data) =>
        data ? evictRecipe(data, recipeId) : data,
      );
      queryClient.removeQueries({ queryKey: recipeKeys.detail(recipeId) });
      // The server cascades the recipe off every menu that held it.
      queryClient.setQueryData<Menu>(menuKeys.menu(), (data) =>
        removeEntry.apply(data, { recipeId }),
      );
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.list() });
    },
  });
}
