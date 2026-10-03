import type { RecipeCard } from "@/features/recipes/data/types";
import { useToggleFavourite } from "@/features/recipes/hooks/useToggleFavourite";
import { useUndoableRemoval } from "@/lib/useUndoableRemoval";

export function useUndoableFavouriteRemoval() {
  const toggleFavourite = useToggleFavourite();

  return useUndoableRemoval<RecipeCard>({
    keyOf: (recipe) => recipe.id,
    remove: (recipe) =>
      toggleFavourite.mutateAsync({ recipeId: recipe.id, wasFavourite: true }),
    restore: (recipe, index) =>
      toggleFavourite.mutate({
        recipeId: recipe.id,
        wasFavourite: false,
        restoreAt: { recipe, index },
      }),
  });
}
