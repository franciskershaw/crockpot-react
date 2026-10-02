import type { RecipeDetail } from "@/features/recipes/data/types";

import type { RecipeFormValues } from "../data/types";

export function fromDetail(recipe: RecipeDetail): RecipeFormValues {
  return {
    name: recipe.name,
    image:
      recipe.imageUrl && recipe.imageFilename
        ? { url: recipe.imageUrl, filename: recipe.imageFilename }
        : null,
    description: recipe.description ?? "",
    timeInMinutes: recipe.timeInMinutes,
    serves: recipe.serves,
    categoryIds: recipe.categories.map((category) => category.id),
    ingredients: recipe.ingredients.map((ingredient) => ({
      itemId: ingredient.itemId,
      itemName: ingredient.itemName,
      itemCategoryName: ingredient.itemCategoryName,
      unitId: ingredient.unitId,
      quantity: String(ingredient.quantity),
    })),
    instructions: recipe.instructions.join("\n"),
    notes: recipe.notes.join("\n"),
  };
}
