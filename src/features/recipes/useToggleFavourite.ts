import { useApiMutation } from "@/lib/Tanstack/useApiMutation";
import type { InfiniteData, QueryKey } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import { addFavourite, removeFavourite } from "./api";
import { recipeKeys } from "./queryKeys";
import type { RecipeListResponse } from "./types";

interface ToggleFavouriteVariables {
  recipeId: string;
  wasFavourite: boolean;
}

type ListQueryData = InfiniteData<RecipeListResponse, number>;
type ListQuerySnapshot = Array<[QueryKey, ListQueryData | undefined]>;

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

  return useApiMutation<
    { message: string },
    ToggleFavouriteVariables,
    ListQuerySnapshot
  >({
    mutationFn: ({ recipeId, wasFavourite }) =>
      wasFavourite ? removeFavourite(recipeId) : addFavourite(recipeId),
    onMutate: async ({ recipeId, wasFavourite }) => {
      await queryClient.cancelQueries({ queryKey: recipeKeys.lists() });

      const previous = queryClient.getQueriesData<ListQueryData>({
        queryKey: recipeKeys.lists(),
      });

      queryClient.setQueriesData<ListQueryData>(
        { queryKey: recipeKeys.lists() },
        (data) => (data ? flipFavourite(data, recipeId, !wasFavourite) : data),
      );

      return previous;
    },
    onError: (_error, _variables, previous) => {
      previous?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });
}
