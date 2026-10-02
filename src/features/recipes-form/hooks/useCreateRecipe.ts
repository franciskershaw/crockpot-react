import { createRecipe } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import type {
  RecipeDetail,
  RecipeWriteInput,
} from "@/features/recipes/data/types";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useApiMutation<RecipeDetail, RecipeWriteInput>({
    mutationFn: (input) => createRecipe(input),
    isHandledError: (error) => error.status === 400 || error.status === 409,
    onSuccess: (recipe) => {
      queryClient.setQueryData(recipeKeys.detail(recipe.id), recipe);
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
}
