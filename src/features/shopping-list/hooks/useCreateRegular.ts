import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { createRegular } from "../data/api";
import { regularsKeys } from "../data/queryKeys";
import type { Regular, RegularInput } from "../data/types";
import { createRegularErrorCopy } from "../utils/createRegularErrorCopy";

export function useCreateRegular() {
  const queryClient = useQueryClient();

  return useApiMutation<Regular, RegularInput>({
    mutationFn: (input) => createRegular(input),
    isHandledError: (error) => createRegularErrorCopy(error) !== null,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: regularsKeys.list() }),
  });
}
