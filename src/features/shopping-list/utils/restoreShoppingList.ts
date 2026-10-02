import type { QueryClient } from "@tanstack/react-query";

import { shoppingListKeys } from "../data/queryKeys";
import type { ShoppingList } from "../data/types";

// Rolls back an optimistic change, unless the list has been wiped since (e.g. the session ended).
export function restoreShoppingList(
  queryClient: QueryClient,
  previous: ShoppingList | undefined,
) {
  queryClient.setQueryData<ShoppingList>(shoppingListKeys.list(), (current) =>
    current === undefined ? undefined : previous,
  );
}
