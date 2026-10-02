import type { InfiniteData } from "@tanstack/react-query";

export type MatchTier = "best" | "good" | null;

export interface RecipeCard {
  id: string;
  name: string;
  imageUrl: string | null;
  imageFilename: string | null;
  timeInMinutes: number;
  serves: number;
  approved: boolean;
  categories: RecipeCategory[];
  createdAt: string;
  isFavourite: boolean;
  matchedIngredientCount: number;
  totalIngredientCount: number;
  matchedCategoryCount: number;
  score: number;
  tier: MatchTier;
}

export interface RecipeListResponse {
  recipes: RecipeCard[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type RecipeListData = InfiniteData<RecipeListResponse, number>;

export type CategoryMode = "include" | "exclude";

export interface RecipeListParams {
  q?: string;
  categoryIds?: string[];
  categoryMode?: CategoryMode;
  ingredientIds?: string[];
  minTime?: number;
  maxTime?: number;
  page?: number;
  limit?: number;
  seed?: string;
  mine?: boolean;
}

export interface RecipeCategory {
  id: string;
  name: string;
}

export interface RecipeTimeRange {
  minTime: number;
  maxTime: number;
}

export interface HydratedIngredient {
  itemId: string;
  itemName: string;
  itemCategoryId: string;
  itemCategoryName: string;
  unitId: string | null;
  unitAbbreviation: string | null;
  quantity: number;
}

// RecipeCard fields are flattened into this response by Go's embedded-struct JSON marshaling (internal/models/recipe.go's RecipeDetail).
export interface RecipeDetail extends RecipeCard {
  description: string | null;
  instructions: string[];
  notes: string[];
  ingredients: HydratedIngredient[];
  createdById: string;
  createdByName: string | null;
  updatedAt: string;
}

// Body of POST /recipes and PATCH /recipes/:id (a full replace).
export interface RecipeWriteInput {
  name: string;
  description: string | null;
  timeInMinutes: number;
  serves: number;
  instructions: string[];
  notes: string[];
  categoryIds: string[];
  ingredients: { itemId: string; unitId: string | null; quantity: number }[];
  image: { url: string; filename: string } | null;
}
