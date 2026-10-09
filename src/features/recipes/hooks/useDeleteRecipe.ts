import { menuKeys } from "@/features/menu/data/queryKeys";
import type { Menu } from "@/features/menu/data/types";
import { removeEntry } from "@/features/menu/utils/menuTransforms";
import { shoppingListKeys } from "@/features/shopping-list/data/queryKeys";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";

import { deleteRecipe } from "../data/api";
import { recipeKeys } from "../data/queryKeys";
import type { RecipeListData } from "../data/types";
import { withoutRecipe } from "../utils/recipeListCache";

const EVICT_FROM: QueryKey[] = [recipeKeys.lists(), recipeKeys.favourites()];

export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useApiMutation<void, string, void>({
    mutationFn: (recipeId) => deleteRecipe(recipeId),
    onSuccess: (_data, recipeId) => {
      for (const queryKey of EVICT_FROM) {
        queryClient.setQueriesData<RecipeListData>({ queryKey }, (data) =>
          data ? withoutRecipe(data, recipeId) : data,
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
