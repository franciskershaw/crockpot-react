import { useUndoQueue } from "@/lib/useUndoQueue";

import type { MenuEntry } from "../data/types";
import { useAddToMenu } from "./useAddToMenu";
import { useRemoveFromMenu } from "./useRemoveFromMenu";

export function useUndoableMenuRemoval() {
  const removeFromMenu = useRemoveFromMenu();
  const addToMenu = useAddToMenu();
  const { start, settle, forget, markUndone, ...queue } =
    useUndoQueue<MenuEntry>();
  const { removals } = queue;

  // mutateAsync: per-call callbacks on mutate only fire for the latest call.
  const remove = (
    entry: MenuEntry,
    anchorKey: string | null,
    index: number,
  ) => {
    const key = entry.recipeId;
    start({ key, item: entry, anchorKey, index });
    return removeFromMenu.mutateAsync({ recipeId: key }).then(
      () => settle(key),
      () => forget(key),
    );
  };

  const canUndo = (key: string) =>
    removals.some((r) => r.key === key && r.settled && !r.undone);

  const undo = (key: string, index: number) => {
    const removal = removals.find((r) => r.key === key);
    if (!removal || !canUndo(key)) return;
    addToMenu.mutate({
      recipe: removal.item.recipe,
      serves: removal.item.serves,
      index,
    });
    markUndone(key);
  };

  return { ...queue, remove, canUndo, undo };
}
