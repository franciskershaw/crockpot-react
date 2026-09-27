import type { RecipeCard } from "@/features/recipes/data/types";
import { useToggleFavourite } from "@/features/recipes/hooks/useToggleFavourite";
import { useUndoWindow } from "@/lib/useUndoWindow";

export function useUndoableFavouriteRemoval() {
  const toggleFavourite = useToggleFavourite();
  const { removed, start, forget, markUndone } = useUndoWindow<{
    recipe: RecipeCard;
    index: number;
  }>();

  const remove = (recipe: RecipeCard, index: number) => {
    const removal = { recipe, index };
    start(removal);
    toggleFavourite.mutate(
      { recipeId: recipe.id, wasFavourite: true },
      { onError: () => forget(removal) },
    );
  };

  const undo = () => {
    if (!removed || removed.undone) return;
    toggleFavourite.mutate({
      recipeId: removed.recipe.id,
      wasFavourite: false,
      restoreAt: { recipe: removed.recipe, index: removed.index },
    });
    markUndone();
  };

  return {
    removed,
    canUndo: removed !== null && !removed.undone && !toggleFavourite.isPending,
    remove,
    undo,
  };
}
