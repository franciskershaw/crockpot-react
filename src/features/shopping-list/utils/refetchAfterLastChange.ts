import type { QueryClient } from "@tanstack/react-query";

import { shoppingListKeys } from "../data/queryKeys";

// Called from onSettled, while the settling mutation still counts as in flight.
export function refetchAfterLastChange(queryClient: QueryClient) {
  if (queryClient.isMutating({ mutationKey: shoppingListKeys.change() }) > 1) {
    return;
  }
  return queryClient.invalidateQueries({ queryKey: shoppingListKeys.list() });
}
