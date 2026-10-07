import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { restockRegulars } from "../data/api";
import { shoppingListKeys } from "../data/queryKeys";

export function useRestockRegulars() {
  const queryClient = useQueryClient();

  return useApiMutation<{ message: string }, string[]>({
    mutationFn: (regularIds) => restockRegulars(regularIds),
    isHandledError: () => true,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.list() }),
  });
}
