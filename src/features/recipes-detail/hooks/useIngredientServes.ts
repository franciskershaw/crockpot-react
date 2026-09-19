import { useMenuEntry } from "@/features/menu/hooks/useMenuEntry";
import type { HydratedIngredient } from "@/features/recipes/data/types";
import { useBoundedServes } from "@/features/recipes/hooks/useBoundedServes";

export function scaleIngredients(
  ingredients: HydratedIngredient[],
  originalServes: number,
  newServes: number,
): HydratedIngredient[] {
  if (originalServes <= 0 || newServes <= 0) return ingredients;

  const factor = newServes / originalServes;
  return ingredients.map((ingredient) => ({
    ...ingredient,
    quantity: Math.round(ingredient.quantity * factor * 100) / 100,
  }));
}

export interface IngredientServesState {
  effectiveServes: number;
  adjustServes: (delta: number) => void;
  canDecrease: boolean;
  canIncrease: boolean;
}

export function useIngredientServes(
  recipeId: string,
  originalServes: number,
): IngredientServesState {
  const { serves: menuServes } = useMenuEntry(recipeId);
  const { serves, adjust, canDecrease, canIncrease } = useBoundedServes(
    menuServes ?? originalServes,
  );

  return {
    effectiveServes: serves,
    adjustServes: adjust,
    canDecrease,
    canIncrease,
  };
}
