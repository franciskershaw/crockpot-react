import type { RecipeCard } from "@/features/recipes/data/types";
import { useToggleFavourite } from "@/features/recipes/hooks/useToggleFavourite";
import { useUndoQueue } from "@/lib/useUndoQueue";

export function useUndoableFavouriteRemoval() {
  const toggleFavourite = useToggleFavourite();
  const { start, settle, forget, claimUndo, ...queue } =
    useUndoQueue<RecipeCard>();

  // mutateAsync: per-call callbacks on mutate only fire for the latest call.
  const remove = (
    recipe: RecipeCard,
    anchorKey: string | null,
    index: number,
  ) => {
    const key = recipe.id;
    start({ key, item: recipe, anchorKey, index });
    return toggleFavourite
      .mutateAsync({ recipeId: key, wasFavourite: true })
      .then(
        () => settle(key),
        () => forget(key),
      );
  };

  const undo = (key: string, index: number) => {
    const removal = claimUndo(key);
    if (!removal) return;
    toggleFavourite.mutate({
      recipeId: key,
      wasFavourite: false,
      restoreAt: { recipe: removal.item, index },
    });
  };

  return { ...queue, remove, undo };
}
