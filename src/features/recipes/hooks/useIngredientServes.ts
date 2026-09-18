import { useEffect, useState } from "react";
import { useMenuEntry } from "@/features/menu/hooks/useMenuEntry";

import type { HydratedIngredient } from "../types";

const MIN_SERVES = 1;
const MAX_SERVES = 50;

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
  const defaultServes = menuServes ?? originalServes;

  const [override, setOverride] = useState<number | null>(null);

  // A locally-adjusted view shouldn't persist once the underlying default it was adjusted from has moved on.
  useEffect(() => {
    setOverride(null);
  }, [defaultServes]);

  const effectiveServes = override ?? defaultServes;

  const adjustServes = (delta: number) => {
    setOverride(
      Math.max(MIN_SERVES, Math.min(MAX_SERVES, effectiveServes + delta)),
    );
  };

  return {
    effectiveServes,
    adjustServes,
    canDecrease: effectiveServes > MIN_SERVES,
    canIncrease: effectiveServes < MAX_SERVES,
  };
}
