import { menuKeys } from "@/features/menu/data/queryKeys";
import { updateRecipe } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import type {
  RecipeDetail,
  RecipeWriteInput,
} from "@/features/recipes/data/types";
import { shoppingListKeys } from "@/features/shopping-list/data/queryKeys";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export function useUpdateRecipe(id: string) {
  const queryClient = useQueryClient();

  return useApiMutation<RecipeDetail, RecipeWriteInput>({
    mutationFn: (input) => updateRecipe(id, input),
    isHandledError: (error) => error.status === 400,
    onSuccess: (recipe) => {
      queryClient.setQueryData(recipeKeys.detail(recipe.id), recipe);
      for (const queryKey of [
        recipeKeys.lists(),
        recipeKeys.favourites(),
        menuKeys.menu(),
        shoppingListKeys.list(),
      ]) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}
