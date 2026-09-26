import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { regenerateShoppingList } from "../data/api";
import { shoppingListKeys } from "../data/queryKeys";

export function useRegenerateShoppingList() {
  const queryClient = useQueryClient();

  return useApiMutation<{ message: string }, void>({
    mutationFn: regenerateShoppingList,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.list() }),
  });
}
