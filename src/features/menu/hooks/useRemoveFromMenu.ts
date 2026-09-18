import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { removeMenuEntry } from "../data/api";
import { menuKeys } from "../data/queryKeys";
import type { Menu } from "../data/types";

interface RemoveFromMenuVariables {
  recipeId: string;
}

function removeEntry(
  data: Menu | undefined,
  recipeId: string,
): Menu | undefined {
  if (!data) return data;
  return { entries: data.entries.filter((e) => e.recipeId !== recipeId) };
}

export function useRemoveFromMenu() {
  const queryClient = useQueryClient();

  return useApiMutation<
    { message: string },
    RemoveFromMenuVariables,
    { previous: Menu | undefined }
  >({
    mutationFn: ({ recipeId }) => removeMenuEntry(recipeId),
    onMutate: async ({ recipeId }) => {
      await queryClient.cancelQueries({ queryKey: menuKeys.menu() });
      const previous = queryClient.getQueryData<Menu>(menuKeys.menu());
      queryClient.setQueryData<Menu>(menuKeys.menu(), (data) =>
        removeEntry(data, recipeId),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(menuKeys.menu(), context?.previous);
    },
  });
}
