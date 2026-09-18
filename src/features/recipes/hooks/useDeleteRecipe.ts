import { useApiMutation } from "@/lib/Tanstack/useApiMutation";
import type { InfiniteData } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import { deleteRecipe } from "../api";
import { recipeKeys } from "../queryKeys";
import type { RecipeListResponse } from "../types";

const LIST_FILTER = { queryKey: recipeKeys.lists() };

type ListQueryData = InfiniteData<RecipeListResponse, number>;

function evictRecipe(data: ListQueryData, recipeId: string): ListQueryData {
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
      queryClient.setQueriesData<ListQueryData>(LIST_FILTER, (data) =>
        data ? evictRecipe(data, recipeId) : data,
      );
      queryClient.removeQueries({ queryKey: recipeKeys.detail(recipeId) });
    },
  });
}
