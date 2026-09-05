import { useApiMutation } from "@/lib/Tanstack/useApiMutation";
import type { InfiniteData } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import { addFavourite, removeFavourite } from "../api";
import { recipeKeys } from "../queryKeys";
import type { RecipeListResponse } from "../types";

interface ToggleFavouriteVariables {
  recipeId: string;
  wasFavourite: boolean;
}

type ListQueryData = InfiniteData<RecipeListResponse, number>;

const LIST_FILTER = { queryKey: recipeKeys.lists() };

function flipFavourite(
  data: ListQueryData,
  recipeId: string,
  isFavourite: boolean,
): ListQueryData {
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      recipes: page.recipes.map((recipe) =>
        recipe.id === recipeId ? { ...recipe, isFavourite } : recipe,
      ),
    })),
  };
}

export function useToggleFavourite() {
  const queryClient = useQueryClient();

  return useApiMutation<{ message: string }, ToggleFavouriteVariables, void>({
    mutationFn: ({ recipeId, wasFavourite }) =>
      wasFavourite ? removeFavourite(recipeId) : addFavourite(recipeId),
    onMutate: async ({ recipeId, wasFavourite }) => {
      await queryClient.cancelQueries(LIST_FILTER);

      queryClient.setQueriesData<ListQueryData>(LIST_FILTER, (data) =>
        data ? flipFavourite(data, recipeId, !wasFavourite) : data,
      );
    },
    onError: (_error, { recipeId, wasFavourite }) => {
      // Revert only this recipe's flip, not a whole snapshot.
      queryClient.setQueriesData<ListQueryData>(LIST_FILTER, (data) =>
        data ? flipFavourite(data, recipeId, wasFavourite) : data,
      );
    },
  });
}
