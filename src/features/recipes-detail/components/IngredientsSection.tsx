import type { RecipeDetail } from "@/features/recipes/data/types";
import { Minus, Plus, Users } from "lucide-react";

import {
  scaleIngredients,
  useIngredientServes,
} from "../hooks/useIngredientServes";
import {
  getCategoryIcon,
  groupIngredientsByCategory,
} from "../ingredientCategories";

export function IngredientsSection({ recipe }: { recipe: RecipeDetail }) {
  const { effectiveServes, adjustServes, canDecrease, canIncrease } =
    useIngredientServes(recipe.id, recipe.serves);

  const scaledIngredients = scaleIngredients(
    recipe.ingredients,
    recipe.serves,
    effectiveServes,
  );
  const grouped = groupIngredientsByCategory(scaledIngredients);

  return (
    <div className="pt-3 md:rounded-lg md:border md:border-border md:bg-card md:p-6 md:shadow-[0_2px_0_var(--color-card-shadow)]">
      <h2 className="mb-5 hidden font-display text-2xl text-foreground md:block">
        Ingredients ({scaledIngredients.length})
      </h2>

      <fieldset className="m-0 mb-6 flex min-w-0 items-center justify-between rounded-lg border px-4 py-3">
        <legend className="sr-only">Servings</legend>
        <div className="flex items-center gap-2 text-sm font-medium text-ingredient-chip-text">
          <Users size={16} strokeWidth={2} />
          Serves
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => adjustServes(-1)}
            disabled={!canDecrease}
            aria-label="Decrease servings"
            className="flex size-7 cursor-pointer items-center justify-center rounded-full border border-ingredient-chip-border bg-card text-ingredient-chip-text shadow-sm transition-colors hover:bg-card/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Minus size={14} strokeWidth={2} />
          </button>
          <span className="min-w-6 text-center font-semibold text-foreground">
            {effectiveServes}
          </span>
          <button
            type="button"
            onClick={() => adjustServes(1)}
            disabled={!canIncrease}
            aria-label="Increase servings"
            className="flex size-7 cursor-pointer items-center justify-center rounded-full border border-ingredient-chip-border bg-card text-ingredient-chip-text shadow-sm transition-colors hover:bg-card/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={14} strokeWidth={2} />
          </button>
        </div>
      </fieldset>

      <div className="divide-y divide-border">
        {Object.entries(grouped).map(([categoryName, ingredients]) => {
          const Icon = getCategoryIcon(categoryName);
          return (
            <div key={categoryName} className="py-5 first:pt-0 last:pb-0">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <span className="flex size-7 items-center justify-center rounded-full bg-ingredient-chip-bg text-ingredient-chip-text">
                  <Icon size={16} strokeWidth={2} />
                </span>
                {categoryName}
              </h3>
              <div className="space-y-2">
                {ingredients.map((ingredient) => (
                  <div
                    key={ingredient.itemId}
                    className="flex items-baseline gap-2 text-[17px]"
                  >
                    <span className="flex items-baseline gap-1">
                      <span className="font-semibold text-foreground">
                        {ingredient.quantity}
                      </span>
                      {ingredient.unitAbbreviation && (
                        <span className="text-muted-foreground">
                          {ingredient.unitAbbreviation}
                        </span>
                      )}
                    </span>
                    <span className="text-foreground">
                      {ingredient.itemName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
