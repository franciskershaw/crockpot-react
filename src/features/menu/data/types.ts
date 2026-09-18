import type { RecipeCard } from "@/features/recipes/data/types";

export interface MenuEntry {
  recipeId: string;
  serves: number;
  recipe: RecipeCard;
}

export interface Menu {
  entries: MenuEntry[];
}
