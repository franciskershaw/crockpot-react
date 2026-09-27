import type { RecipeCard, RecipeListData } from "../data/types";

// index is the recipe's position across all loaded pages, as the page renders them.
export interface FavouriteSlot {
  recipe: RecipeCard;
  index: number;
}

export function withTotal(data: RecipeListData, delta: number): RecipeListData {
  return {
    ...data,
    pages: data.pages.map((page) => ({ ...page, total: page.total + delta })),
  };
}

export function findFavourite(
  data: RecipeListData,
  recipeId: string,
): FavouriteSlot | undefined {
  let offset = 0;
  for (const page of data.pages) {
    const index = page.recipes.findIndex((recipe) => recipe.id === recipeId);
    if (index !== -1)
      return { recipe: page.recipes[index], index: offset + index };
    offset += page.recipes.length;
  }
}

export function withoutFavourite(
  data: RecipeListData,
  recipeId: string,
): RecipeListData {
  if (!findFavourite(data, recipeId)) return data;
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

export function withFavouriteRestored(
  data: RecipeListData,
  { recipe, index }: FavouriteSlot,
): RecipeListData {
  if (findFavourite(data, recipe.id) || data.pages.length === 0) return data;
  let remaining = index;
  let target = data.pages.length - 1;
  for (const [pageIndex, page] of data.pages.entries()) {
    if (remaining <= page.recipes.length) {
      target = pageIndex;
      break;
    }
    remaining -= page.recipes.length;
  }
  return withTotal(
    {
      ...data,
      pages: data.pages.map((page, pageIndex) =>
        pageIndex === target
          ? {
              ...page,
              recipes: [
                ...page.recipes.slice(0, remaining),
                recipe,
                ...page.recipes.slice(remaining),
              ],
            }
          : page,
      ),
    },
    1,
  );
}
