import { useEffect, useState } from "react";

import type { MenuEntry } from "../data/types";
import { useAddToMenu } from "./useAddToMenu";
import { useRemoveFromMenu } from "./useRemoveFromMenu";

export const UNDO_WINDOW_MS = 5000;

export interface RemovedMenuEntry {
  entry: MenuEntry;
  index: number;
  undone?: boolean;
}

export function useUndoableMenuRemoval() {
  const removeFromMenu = useRemoveFromMenu();
  const addToMenu = useAddToMenu();
  const [removed, setRemoved] = useState<RemovedMenuEntry | null>(null);

  useEffect(() => {
    if (!removed) return;
    const timer = setTimeout(() => setRemoved(null), UNDO_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [removed]);

  const remove = (entry: MenuEntry, index: number) => {
    const removal = { entry, index };
    setRemoved(removal);
    removeFromMenu.mutate(
      { recipeId: entry.recipeId },
      {
        onError: () =>
          setRemoved((current) => (current === removal ? null : current)),
      },
    );
  };

  // Kept (marked undone) until the timer clears it, so the slot survives
  // the tick before the optimistic re-add lands.
  const undo = () => {
    if (!removed || removed.undone) return;
    addToMenu.mutate({
      recipe: removed.entry.recipe,
      serves: removed.entry.serves,
      index: removed.index,
    });
    setRemoved({ ...removed, undone: true });
  };

  return {
    removed,
    canUndo: removed !== null && !removed.undone && !removeFromMenu.isPending,
    remove,
    undo,
  };
}
