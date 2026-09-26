import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { addShoppingListItem } from "../data/api";
import { shoppingListKeys } from "../data/queryKeys";

interface AddShoppingListItemVariables {
  itemId: string;
  quantity: number;
  unitId: string | null;
}

export function useAddShoppingListItem() {
  const queryClient = useQueryClient();

  return useApiMutation<{ message: string }, AddShoppingListItemVariables>({
    mutationFn: ({ itemId, quantity, unitId }) =>
      addShoppingListItem(itemId, quantity, unitId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.list() }),
  });
}
