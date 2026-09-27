import { removeMenuEntry } from "../data/api";
import { removeEntry } from "../utils/menuTransforms";
import { useOptimisticMenuMutation } from "./useOptimisticMenuMutation";

export function useRemoveFromMenu() {
  return useOptimisticMenuMutation({
    mutationFn: ({ recipeId }) => removeMenuEntry(recipeId),
    ...removeEntry,
  });
}
