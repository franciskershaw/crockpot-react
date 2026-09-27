import { addMenuEntry } from "../data/api";
import { addEntry } from "../utils/menuTransforms";
import { useOptimisticMenuMutation } from "./useOptimisticMenuMutation";

export function useAddToMenu() {
  return useOptimisticMenuMutation({
    mutationFn: ({ recipe, serves }) => addMenuEntry(recipe.id, serves),
    ...addEntry,
  });
}
