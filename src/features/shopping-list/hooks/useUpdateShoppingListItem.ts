import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { updateShoppingListItem } from "../data/api";
import { shoppingListKeys } from "../data/queryKeys";
import type { ShoppingList } from "../data/types";
import { refetchAfterLastChange } from "../utils/refetchAfterLastChange";

interface UpdateShoppingListItemVariables {
  id: string;
  obtained?: boolean;
  quantity?: number;
}

export function useUpdateShoppingListItem() {
  const queryClient = useQueryClient();

  return useApiMutation<
    { message: string },
    UpdateShoppingListItemVariables,
    { previous: ShoppingList | undefined }
  >({
    mutationKey: shoppingListKeys.change(),
    mutationFn: ({ id, ...changes }) => updateShoppingListItem(id, changes),
    onMutate: async ({ id, ...changes }) => {
      await queryClient.cancelQueries({ queryKey: shoppingListKeys.list() });
      const previous = queryClient.getQueryData<ShoppingList>(
        shoppingListKeys.list(),
      );
      queryClient.setQueryData<ShoppingList>(shoppingListKeys.list(), (data) =>
        data
          ? {
              items: data.items.map((item) =>
                item.id === id ? { ...item, ...changes } : item,
              ),
            }
          : data,
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(shoppingListKeys.list(), context?.previous);
    },
    onSettled: () => refetchAfterLastChange(queryClient),
  });
}
