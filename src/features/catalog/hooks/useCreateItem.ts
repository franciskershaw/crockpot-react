import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { createItem } from "../data/api";
import { catalogKeys } from "../data/queryKeys";
import type { CreateItemInput, Item } from "../data/types";

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useApiMutation<Item, CreateItemInput>({
    mutationFn: (input) => createItem(input),
    isHandledError: (error) => error.status === 409,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: catalogKeys.items }),
  });
}
