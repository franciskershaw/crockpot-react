import { buildRecipeListSearchParams } from "./api";
import type { RecipeListParams } from "./types";

export const recipeKeys = {
  all: ["recipes"] as const,
  lists: () => [...recipeKeys.all, "list"] as const,
  // Keyed off the normalized request string so params resolving to the
  // same request (e.g. categoryMode with no categoryIds) share a key.
  list: (params: RecipeListParams) =>
    [
      ...recipeKeys.lists(),
      buildRecipeListSearchParams(params).toString(),
    ] as const,
};
