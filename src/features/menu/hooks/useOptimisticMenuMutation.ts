import { shoppingListKeys } from "@/features/shopping-list/data/queryKeys";
import { refetchAfterLastMutation } from "@/lib/tanstack/refetchAfterLastMutation";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { menuKeys } from "../data/queryKeys";
import type { Menu } from "../data/types";
import { menuErrorCopy } from "../utils/menuErrorCopy";
import type { MenuTransform } from "../utils/menuTransforms";

// A failure marks the menu stale; whichever menu change settles last does the one refetch. Successes never refetch.
export function useOptimisticMenuMutation<TVariables, TBefore>({
  mutationFn,
  capture,
  apply,
  revert,
}: {
  mutationFn: (variables: TVariables) => Promise<{ message: string }>;
} & MenuTransform<TVariables, TBefore>) {
  const queryClient = useQueryClient();

  return useApiMutation<{ message: string }, TVariables, { before: TBefore }>({
    mutationKey: menuKeys.change(),
    mutationFn,
    isHandledError: (error) => menuErrorCopy(error) !== null,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: menuKeys.menu() });
      const before = capture(
        queryClient.getQueryData<Menu>(menuKeys.menu()),
        variables,
      );
      queryClient.setQueryData<Menu>(menuKeys.menu(), (data) =>
        apply(data, variables),
      );
      return { before };
    },
    onError: (error, variables, context) => {
      const copy = menuErrorCopy(error);
      if (copy) toast.error(copy);
      if (context) {
        queryClient.setQueryData<Menu>(menuKeys.menu(), (data) =>
          revert(data, variables, context.before),
        );
      }
      return queryClient.invalidateQueries({
        queryKey: menuKeys.menu(),
        refetchType: "none",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.list() }),
    onSettled: () => {
      if (!queryClient.getQueryState(menuKeys.menu())?.isInvalidated) return;
      return refetchAfterLastMutation(
        queryClient,
        menuKeys.change(),
        menuKeys.menu(),
      );
    },
  });
}
