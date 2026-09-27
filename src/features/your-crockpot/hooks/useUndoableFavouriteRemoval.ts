import type { RecipeCard } from "@/features/recipes/data/types";
import { useToggleFavourite } from "@/features/recipes/hooks/useToggleFavourite";
import { useUndoQueue } from "@/lib/useUndoQueue";

export function useUndoableFavouriteRemoval() {
  const toggleFavourite = useToggleFavourite();
  const { start, settle, forget, markUndone, ...queue } =
    useUndoQueue<RecipeCard>();
  const { removals } = queue;

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

  const canUndo = (key: string) =>
    removals.some((r) => r.key === key && r.settled && !r.undone);

  const undo = (key: string, index: number) => {
    const removal = removals.find((r) => r.key === key);
    if (!removal || !canUndo(key)) return;
    toggleFavourite.mutate({
      recipeId: key,
      wasFavourite: false,
      restoreAt: { recipe: removal.item, index },
    });
    markUndone(key);
  };

  return { ...queue, remove, canUndo, undo };
}
