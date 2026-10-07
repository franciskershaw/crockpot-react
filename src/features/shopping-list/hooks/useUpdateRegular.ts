import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { updateRegular } from "../data/api";
import { regularsKeys } from "../data/queryKeys";
import type { Regular } from "../data/types";

interface UpdateRegularVariables {
  id: string;
  quantity: number;
  unitId: string | null;
}

export function useUpdateRegular() {
  const queryClient = useQueryClient();

  return useApiMutation<Regular, UpdateRegularVariables>({
    mutationFn: ({ id, quantity, unitId }) =>
      updateRegular(id, { quantity, unitId }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: regularsKeys.list() }),
  });
}
