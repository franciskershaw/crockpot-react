import type { RecipeCard } from "@/features/recipes/data/types";
import { shoppingListKeys } from "@/features/shopping-list/data/queryKeys";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { addMenuEntry } from "../data/api";
import { menuKeys } from "../data/queryKeys";
import type { Menu } from "../data/types";

interface AddToMenuVariables {
  recipe: RecipeCard;
  serves: number;
  index?: number;
}

function upsertEntry(
  data: Menu | undefined,
  recipe: RecipeCard,
  serves: number,
  index?: number,
): Menu {
  const entries = (data?.entries ?? []).filter(
    (entry) => entry.recipeId !== recipe.id,
  );
  entries.splice(index ?? entries.length, 0, {
    recipeId: recipe.id,
    serves,
    recipe,
  });
  return { entries };
}

export function useAddToMenu() {
  const queryClient = useQueryClient();

  return useApiMutation<
    { message: string },
    AddToMenuVariables,
    { previous: Menu | undefined }
  >({
    mutationFn: ({ recipe, serves }) => addMenuEntry(recipe.id, serves),
    onMutate: async ({ recipe, serves, index }) => {
      await queryClient.cancelQueries({ queryKey: menuKeys.menu() });
      const previous = queryClient.getQueryData<Menu>(menuKeys.menu());
      queryClient.setQueryData<Menu>(menuKeys.menu(), (data) =>
        upsertEntry(data, recipe, serves, index),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(menuKeys.menu(), context?.previous);
      queryClient.invalidateQueries({ queryKey: menuKeys.menu() });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.list() }),
  });
}
