import { useUndoWindow } from "@/lib/useUndoWindow";

import type { MenuEntry } from "../data/types";
import { useAddToMenu } from "./useAddToMenu";
import { useRemoveFromMenu } from "./useRemoveFromMenu";

export function useUndoableMenuRemoval() {
  const removeFromMenu = useRemoveFromMenu();
  const addToMenu = useAddToMenu();
  const { removed, start, forget, markUndone } = useUndoWindow<{
    entry: MenuEntry;
    index: number;
  }>();

  const remove = (entry: MenuEntry, index: number) => {
    const removal = { entry, index };
    start(removal);
    removeFromMenu.mutate(
      { recipeId: entry.recipeId },
      { onError: () => forget(removal) },
    );
  };

  const undo = () => {
    if (!removed || removed.undone) return;
    addToMenu.mutate({
      recipe: removed.entry.recipe,
      serves: removed.entry.serves,
      index: removed.index,
    });
    markUndone();
  };

  return {
    removed,
    canUndo: removed !== null && !removed.undone && !removeFromMenu.isPending,
    remove,
    undo,
  };
}
