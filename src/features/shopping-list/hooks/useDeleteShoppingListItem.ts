import { refetchAfterLastMutation } from "@/lib/tanstack/refetchAfterLastMutation";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { deleteShoppingListItem } from "../data/api";
import { shoppingListKeys } from "../data/queryKeys";
import type { ShoppingList } from "../data/types";

interface DeleteShoppingListItemVariables {
  id: string;
}

export function useDeleteShoppingListItem() {
  const queryClient = useQueryClient();

  return useApiMutation<
    { message: string },
    DeleteShoppingListItemVariables,
    { previous: ShoppingList | undefined }
  >({
    mutationKey: shoppingListKeys.change(),
    mutationFn: ({ id }) => deleteShoppingListItem(id),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: shoppingListKeys.list() });
      const previous = queryClient.getQueryData<ShoppingList>(
        shoppingListKeys.list(),
      );
      queryClient.setQueryData<ShoppingList>(shoppingListKeys.list(), (data) =>
        data ? { items: data.items.filter((item) => item.id !== id) } : data,
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(shoppingListKeys.list(), context?.previous);
    },
    onSettled: () =>
      refetchAfterLastMutation(
        queryClient,
        shoppingListKeys.change(),
        shoppingListKeys.list(),
      ),
  });
}
