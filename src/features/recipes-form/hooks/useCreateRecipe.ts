import { createRecipe } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import type { RecipeDetail } from "@/features/recipes/data/types";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { isShownOnForm } from "../utils/saveErrors";

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useApiMutation<RecipeDetail, FormData>({
    mutationFn: (input) => createRecipe(input),
    isHandledError: isShownOnForm,
    onSuccess: (recipe) => {
      queryClient.setQueryData(recipeKeys.detail(recipe.id), recipe);
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
}
