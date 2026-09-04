import type { RecipeListParams } from "./types";

export const recipeKeys = {
  all: ["recipes"] as const,
  lists: () => [...recipeKeys.all, "list"] as const,
  list: (params: RecipeListParams) => [...recipeKeys.lists(), params] as const,
};
