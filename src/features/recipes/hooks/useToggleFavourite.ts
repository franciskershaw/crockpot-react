import { menuKeys } from "@/features/menu/data/queryKeys";
import type { Menu } from "@/features/menu/data/types";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import type { InfiniteData } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import { addFavourite, removeFavourite } from "../data/api";
import { recipeKeys } from "../data/queryKeys";
import type { RecipeDetail, RecipeListResponse } from "../data/types";
import {
  findFavourite,
  withFavouriteRestored,
  withoutFavourite,
  withTotal,
  type FavouritesData,
  type FavouriteSlot,
} from "../utils/favouritesCache";

interface ToggleFavouriteVariables {
  recipeId: string;
  wasFavourite: boolean;
  restoreAt?: FavouriteSlot;
}

interface FavouritesChange {
  removed?: FavouriteSlot;
  restored?: FavouriteSlot;
  counted?: boolean;
}

type ListQueryData = InfiniteData<RecipeListResponse, number>;

const LIST_FILTER = { queryKey: recipeKeys.lists() };
const FAVOURITES_KEY = recipeKeys.favourites();

function applyFavouritesChange(
  data: FavouritesData | undefined,
  { recipeId, wasFavourite, restoreAt }: ToggleFavouriteVariables,
): { data: FavouritesData; change: FavouritesChange } | undefined {
  if (!data) return;
  if (wasFavourite) {
    const removed = findFavourite(data, recipeId);
    return (
      removed && { data: withoutFavourite(data, recipeId), change: { removed } }
    );
  }
  if (findFavourite(data, recipeId)) return;
  if (restoreAt) {
    return {
      data: withFavouriteRestored(data, restoreAt),
      change: { restored: restoreAt },
    };
  }
  return { data: withTotal(data, 1), change: { counted: true } };
}

function revertFavouritesChange(
  data: FavouritesData,
  recipeId: string,
  { removed, restored, counted }: FavouritesChange,
): FavouritesData {
  if (removed) return withFavouriteRestored(data, removed);
  if (restored) return withoutFavourite(data, recipeId);
  if (counted) return withTotal(data, -1);
  return data;
}

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

  return useApiMutation<
    { message: string },
    ToggleFavouriteVariables,
    { favouritesChange?: FavouritesChange }
  >({
    mutationKey: recipeKeys.favouriteChange(),
    mutationFn: ({ recipeId, wasFavourite }) =>
      wasFavourite ? removeFavourite(recipeId) : addFavourite(recipeId),
    onMutate: async (variables) => {
      const { recipeId, wasFavourite } = variables;
      const detailKey = recipeKeys.detail(recipeId);
      await queryClient.cancelQueries(LIST_FILTER);
      await queryClient.cancelQueries({ queryKey: detailKey });
      await queryClient.cancelQueries({ queryKey: menuKeys.menu() });
      await queryClient.cancelQueries({ queryKey: FAVOURITES_KEY });

      queryClient.setQueriesData<ListQueryData>(LIST_FILTER, (data) =>
        data ? flipFavourite(data, recipeId, !wasFavourite) : data,
      );
      queryClient.setQueryData<RecipeDetail>(detailKey, (data) =>
        data ? flipFavouriteDetail(data, !wasFavourite) : data,
      );
      queryClient.setQueryData<Menu>(menuKeys.menu(), (data) =>
        data ? flipFavouriteOnMenu(data, recipeId, !wasFavourite) : data,
      );

      const applied = applyFavouritesChange(
        queryClient.getQueryData<FavouritesData>(FAVOURITES_KEY),
        variables,
      );
      if (applied) {
        queryClient.setQueryData(FAVOURITES_KEY, applied.data);
      }
      return { favouritesChange: applied?.change };
    },
    onError: (_error, { recipeId, wasFavourite }, context) => {
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
      const favouritesChange = context?.favouritesChange;
      if (favouritesChange) {
        queryClient.setQueryData<FavouritesData>(FAVOURITES_KEY, (data) =>
          data
            ? revertFavouritesChange(data, recipeId, favouritesChange)
            : data,
        );
      }
    },
    // Offsets may have shifted; the page refetches before loading more, or on its next visit.
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: FAVOURITES_KEY,
        refetchType: "none",
      }),
  });
}
