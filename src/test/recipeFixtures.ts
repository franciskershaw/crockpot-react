import type { RecipeCard, RecipeDetail } from "@/features/recipes/data/types";

export function buildRecipeCard(
  overrides: Partial<RecipeCard> = {},
): RecipeCard {
  return {
    id: "r_1",
    name: "BBQ Pulled Pork",
    imageUrl: null,
    imageFilename: null,
    timeInMinutes: 30,
    serves: 4,
    approved: true,
    categories: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    isFavourite: false,
    matchedIngredientCount: 0,
    totalIngredientCount: 0,
    matchedCategoryCount: 0,
    score: 0,
    tier: null,
    ...overrides,
  };
}

export function buildRecipeDetail(
  overrides: Partial<RecipeDetail> = {},
): RecipeDetail {
  return {
    ...buildRecipeCard(),
    description: null,
    instructions: [],
    notes: [],
    ingredients: [],
    createdById: "u_1",
    createdByName: "Jamie",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}
