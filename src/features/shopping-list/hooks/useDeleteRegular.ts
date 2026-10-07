import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { deleteRegular } from "../data/api";
import { regularsKeys } from "../data/queryKeys";

export function useDeleteRegular() {
  const queryClient = useQueryClient();

  return useApiMutation<void, { id: string }>({
    mutationFn: ({ id }) => deleteRegular(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: regularsKeys.list() }),
  });
}
