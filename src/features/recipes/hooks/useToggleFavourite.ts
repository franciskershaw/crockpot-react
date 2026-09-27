import { menuKeys } from "@/features/menu/data/queryKeys";
import type { Menu } from "@/features/menu/data/types";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import type { InfiniteData } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import { addFavourite, removeFavourite } from "../data/api";
import { recipeKeys } from "../data/queryKeys";
import type {
  RecipeCard,
  RecipeDetail,
  RecipeListResponse,
} from "../data/types";

interface ToggleFavouriteVariables {
  recipeId: string;
  wasFavourite: boolean;
}

type ListQueryData = InfiniteData<RecipeListResponse, number>;

const LIST_FILTER = { queryKey: recipeKeys.lists() };
const FAVOURITES_KEY = recipeKeys.favourites();

interface RemovedFavourite {
  recipe: RecipeCard;
  pageIndex: number;
  index: number;
}

function withTotal(data: ListQueryData, delta: number): ListQueryData {
  return {
    ...data,
    pages: data.pages.map((page) => ({ ...page, total: page.total + delta })),
  };
}

function findFavourite(
  data: ListQueryData,
  recipeId: string,
): RemovedFavourite | undefined {
  for (const [pageIndex, page] of data.pages.entries()) {
    const index = page.recipes.findIndex((recipe) => recipe.id === recipeId);
    if (index !== -1) {
      return { recipe: page.recipes[index], pageIndex, index };
    }
  }
}

function withoutFavourite(
  data: ListQueryData,
  recipeId: string,
): ListQueryData {
  return withTotal(
    {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        recipes: page.recipes.filter((recipe) => recipe.id !== recipeId),
      })),
    },
    -1,
  );
}

function withFavouriteRestored(
  data: ListQueryData,
  { recipe, pageIndex, index }: RemovedFavourite,
): ListQueryData {
  if (findFavourite(data, recipe.id) || data.pages.length === 0) return data;
  const target = Math.min(pageIndex, data.pages.length - 1);
  return withTotal(
    {
      ...data,
      pages: data.pages.map((page, i) =>
        i === target
          ? {
              ...page,
              recipes: [
                ...page.recipes.slice(0, index),
                recipe,
                ...page.recipes.slice(index),
              ],
            }
          : page,
      ),
    },
    1,
  );
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
    { removedFavourite?: RemovedFavourite }
  >({
    mutationFn: ({ recipeId, wasFavourite }) =>
      wasFavourite ? removeFavourite(recipeId) : addFavourite(recipeId),
    onMutate: async ({ recipeId, wasFavourite }) => {
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

      const favourites =
        queryClient.getQueryData<ListQueryData>(FAVOURITES_KEY);
      const removedFavourite =
        wasFavourite && favourites
          ? findFavourite(favourites, recipeId)
          : undefined;
      if (removedFavourite) {
        queryClient.setQueryData<ListQueryData>(FAVOURITES_KEY, (data) =>
          data ? withoutFavourite(data, recipeId) : data,
        );
      }
      return { removedFavourite };
    },
    onSuccess: (_data, { wasFavourite }) => {
      if (!wasFavourite) {
        queryClient.invalidateQueries({
          queryKey: FAVOURITES_KEY,
          refetchType: "none",
        });
      }
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
      const removedFavourite = context?.removedFavourite;
      if (removedFavourite) {
        queryClient.setQueryData<ListQueryData>(FAVOURITES_KEY, (data) =>
          data ? withFavouriteRestored(data, removedFavourite) : data,
        );
      }
    },
  });
}
