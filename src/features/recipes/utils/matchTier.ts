import type { RecipeCard } from "../data/types";

// One selected category trivially scores 1.0 for every recipe with that
// tag; a single ingredient doesn't, since it's scored against the recipe's own count.
export function visibleMatchTier(
  tier: RecipeCard["tier"],
  selectedIngredientCount: number,
  selectedCategoryCount: number,
): RecipeCard["tier"] {
  if (tier === null) return null;
  if (selectedIngredientCount === 0 && selectedCategoryCount === 1) {
    return null;
  }
  return tier;
}
