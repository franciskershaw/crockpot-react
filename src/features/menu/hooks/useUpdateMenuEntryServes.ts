import { useApiMutation } from "@/lib/Tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { updateMenuEntryServes } from "../api";
import { menuKeys } from "../queryKeys";
import type { Menu } from "../types";

interface UpdateMenuEntryServesVariables {
  recipeId: string;
  serves: number;
}

function patchServes(
  data: Menu | undefined,
  recipeId: string,
  serves: number,
): Menu | undefined {
  if (!data) return data;
  return {
    entries: data.entries.map((entry) =>
      entry.recipeId === recipeId ? { ...entry, serves } : entry,
    ),
  };
}

export function useUpdateMenuEntryServes() {
  const queryClient = useQueryClient();

  return useApiMutation<
    { message: string },
    UpdateMenuEntryServesVariables,
    { previous: Menu | undefined }
  >({
    mutationFn: ({ recipeId, serves }) =>
      updateMenuEntryServes(recipeId, serves),
    onMutate: async ({ recipeId, serves }) => {
      await queryClient.cancelQueries({ queryKey: menuKeys.menu() });
      const previous = queryClient.getQueryData<Menu>(menuKeys.menu());
      queryClient.setQueryData<Menu>(menuKeys.menu(), (data) =>
        patchServes(data, recipeId, serves),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(menuKeys.menu(), context?.previous);
    },
  });
}
