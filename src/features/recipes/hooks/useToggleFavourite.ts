import { menuKeys } from "@/features/menu/data/queryKeys";
import type { Menu } from "@/features/menu/data/types";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import type { InfiniteData } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import { addFavourite, removeFavourite } from "../data/api";
import { recipeKeys } from "../data/queryKeys";
import type { RecipeDetail, RecipeListResponse } from "../data/types";

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

function flipFavouriteOnMenu(
  data: Menu,
  recipeId: string,
  isFavourite: boolean,
): Menu {
  return {
    entries: data.entries.map((entry) =>
      entry.recipeId === recipeId
        ? { ...entry, recipe: { ...entry.recipe, isFavourite } }
        : entry,
    ),
  };
}

function flipFavouriteDetail(
  data: RecipeDetail,
  isFavourite: boolean,
): RecipeDetail {
  return { ...data, isFavourite };
}

export function useToggleFavourite() {
  const queryClient = useQueryClient();

  return useApiMutation<{ message: string }, ToggleFavouriteVariables, void>({
    mutationFn: ({ recipeId, wasFavourite }) =>
      wasFavourite ? removeFavourite(recipeId) : addFavourite(recipeId),
    onMutate: async ({ recipeId, wasFavourite }) => {
      const detailKey = recipeKeys.detail(recipeId);
      await queryClient.cancelQueries(LIST_FILTER);
      await queryClient.cancelQueries({ queryKey: detailKey });
      await queryClient.cancelQueries({ queryKey: menuKeys.menu() });

      queryClient.setQueriesData<ListQueryData>(LIST_FILTER, (data) =>
        data ? flipFavourite(data, recipeId, !wasFavourite) : data,
      );
      queryClient.setQueryData<RecipeDetail>(detailKey, (data) =>
        data ? flipFavouriteDetail(data, !wasFavourite) : data,
      );
      queryClient.setQueryData<Menu>(menuKeys.menu(), (data) =>
        data ? flipFavouriteOnMenu(data, recipeId, !wasFavourite) : data,
      );
    },
    onError: (_error, { recipeId, wasFavourite }) => {
      // Revert only this recipe's flip, not a whole snapshot.
      queryClient.setQueriesData<ListQueryData>(LIST_FILTER, (data) =>
        data ? flipFavourite(data, recipeId, wasFavourite) : data,
      );
      queryClient.setQueryData<RecipeDetail>(
        recipeKeys.detail(recipeId),
        (data) => (data ? flipFavouriteDetail(data, wasFavourite) : data),
      );
      queryClient.setQueryData<Menu>(menuKeys.menu(), (data) =>
        data ? flipFavouriteOnMenu(data, recipeId, wasFavourite) : data,
      );
    },
  });
}
