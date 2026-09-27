import { updateMenuEntryServes } from "../data/api";
import { setServes } from "../utils/menuTransforms";
import { useOptimisticMenuMutation } from "./useOptimisticMenuMutation";

export function useUpdateMenuEntryServes() {
  return useOptimisticMenuMutation({
    mutationFn: ({ recipeId, serves }) =>
      updateMenuEntryServes(recipeId, serves),
    ...setServes,
  });
}
