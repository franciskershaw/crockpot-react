import { refetchAfterLastMutation } from "@/lib/tanstack/refetchAfterLastMutation";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { clearShoppingList } from "../data/api";
import { shoppingListKeys } from "../data/queryKeys";
import type { ShoppingList } from "../data/types";
import { restoreShoppingList } from "../utils/restoreShoppingList";

export function useClearShoppingList() {
  const queryClient = useQueryClient();

  return useApiMutation<
    { message: string },
    void,
    { previous: ShoppingList | undefined }
  >({
    mutationKey: shoppingListKeys.change(),
    mutationFn: clearShoppingList,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: shoppingListKeys.list() });
      const previous = queryClient.getQueryData<ShoppingList>(
        shoppingListKeys.list(),
      );
      queryClient.setQueryData<ShoppingList>(shoppingListKeys.list(), {
        items: [],
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      restoreShoppingList(queryClient, context?.previous);
    },
    onSettled: () =>
      refetchAfterLastMutation(
        queryClient,
        shoppingListKeys.change(),
        shoppingListKeys.list(),
      ),
  });
}
