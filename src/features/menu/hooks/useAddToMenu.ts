import type { RecipeCard } from "@/features/recipes/types";
import { useApiMutation } from "@/lib/Tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { addMenuEntry } from "../api";
import { menuKeys } from "../queryKeys";
import type { Menu } from "../types";

interface AddToMenuVariables {
  recipe: RecipeCard;
  serves: number;
}

function upsertEntry(
  data: Menu | undefined,
  recipe: RecipeCard,
  serves: number,
): Menu {
  const withoutRecipe = (data?.entries ?? []).filter(
    (entry) => entry.recipeId !== recipe.id,
  );
  return {
    entries: [...withoutRecipe, { recipeId: recipe.id, serves, recipe }],
  };
}

export function useAddToMenu() {
  const queryClient = useQueryClient();

  return useApiMutation<
    { message: string },
    AddToMenuVariables,
    { previous: Menu | undefined }
  >({
    mutationFn: ({ recipe, serves }) => addMenuEntry(recipe.id, serves),
    onMutate: async ({ recipe, serves }) => {
      await queryClient.cancelQueries({ queryKey: menuKeys.menu() });
      const previous = queryClient.getQueryData<Menu>(menuKeys.menu());
      queryClient.setQueryData<Menu>(menuKeys.menu(), (data) =>
        upsertEntry(data, recipe, serves),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(menuKeys.menu(), context?.previous);
    },
  });
}
