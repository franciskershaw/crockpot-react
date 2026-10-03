import { useUndoableRemoval } from "@/lib/useUndoableRemoval";

import type { MenuEntry } from "../data/types";
import { useAddToMenu } from "./useAddToMenu";
import { useRemoveFromMenu } from "./useRemoveFromMenu";

export function useUndoableMenuRemoval() {
  const removeFromMenu = useRemoveFromMenu();
  const addToMenu = useAddToMenu();

  return useUndoableRemoval<MenuEntry>({
    keyOf: (entry) => entry.recipeId,
    remove: (entry) => removeFromMenu.mutateAsync({ recipeId: entry.recipeId }),
    restore: (entry, index) =>
      addToMenu.mutate({ recipe: entry.recipe, serves: entry.serves, index }),
  });
}
