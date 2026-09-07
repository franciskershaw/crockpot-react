import type { RecipeCard } from "@/features/recipes/types";

export interface MenuEntry {
  recipeId: string;
  serves: number;
  recipe: RecipeCard;
}

export interface Menu {
  entries: MenuEntry[];
}
