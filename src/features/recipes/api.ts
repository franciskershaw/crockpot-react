import { apiFetch } from "@/lib/http/client";

import type {
  Item,
  RecipeCategory,
  RecipeListParams,
  RecipeListResponse,
} from "./types";

// categoryId/ingredientId are repeated params; categoryMode only makes sense alongside categoryIds.
export function buildRecipeListSearchParams(
  params: RecipeListParams,
): URLSearchParams {
  const search = new URLSearchParams();

  const q = params.q?.trim();
  if (q) search.set("q", q);

  if (params.categoryIds?.length) {
    for (const id of params.categoryIds) search.append("categoryId", id);
    if (params.categoryMode) search.set("categoryMode", params.categoryMode);
  }

  if (params.ingredientIds?.length) {
    for (const id of params.ingredientIds) search.append("ingredientId", id);
  }

  if (params.minTime !== undefined) {
    search.set("minTime", String(params.minTime));
  }
  if (params.maxTime !== undefined) {
    search.set("maxTime", String(params.maxTime));
  }
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.limit !== undefined) search.set("limit", String(params.limit));

  return search;
}

export function listRecipes(
  params: RecipeListParams = {},
): Promise<RecipeListResponse> {
  const search = buildRecipeListSearchParams(params).toString();
  return apiFetch<RecipeListResponse>(`/recipes${search ? `?${search}` : ""}`);
}

export function listRecipeCategories(): Promise<RecipeCategory[]> {
  return apiFetch<RecipeCategory[]>("/recipe-categories");
}

export function listItems(): Promise<Item[]> {
  return apiFetch<Item[]>("/items");
}

export function addFavourite(recipeId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/recipes/${recipeId}/favourite`, {
    method: "POST",
  });
}

export function removeFavourite(
  recipeId: string,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/recipes/${recipeId}/favourite`, {
    method: "DELETE",
  });
}
