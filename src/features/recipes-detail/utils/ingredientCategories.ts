import type { HydratedIngredient } from "@/features/recipes/data/types";

export function groupIngredientsByCategory(
  ingredients: HydratedIngredient[],
): Record<string, HydratedIngredient[]> {
  return ingredients.reduce<Record<string, HydratedIngredient[]>>(
    (acc, ingredient) => {
      (acc[ingredient.itemCategoryName] ??= []).push(ingredient);
      return acc;
    },
    {},
  );
}
