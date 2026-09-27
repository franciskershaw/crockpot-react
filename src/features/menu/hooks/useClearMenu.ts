import { clearMenu } from "../data/api";
import { clearEntries } from "../utils/menuTransforms";
import { useOptimisticMenuMutation } from "./useOptimisticMenuMutation";

export function useClearMenu() {
  return useOptimisticMenuMutation({
    mutationFn: () => clearMenu(),
    ...clearEntries,
  });
}
