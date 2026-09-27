import { shoppingListKeys } from "@/features/shopping-list/data/queryKeys";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { clearMenu } from "../data/api";
import { menuKeys } from "../data/queryKeys";
import type { Menu } from "../data/types";

export function useClearMenu() {
  const queryClient = useQueryClient();

  return useApiMutation<
    { message: string },
    void,
    { previous: Menu | undefined }
  >({
    mutationFn: () => clearMenu(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: menuKeys.menu() });
      const previous = queryClient.getQueryData<Menu>(menuKeys.menu());
      queryClient.setQueryData<Menu>(menuKeys.menu(), { entries: [] });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(menuKeys.menu(), context?.previous);
      queryClient.invalidateQueries({ queryKey: menuKeys.menu() });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.list() }),
  });
}
