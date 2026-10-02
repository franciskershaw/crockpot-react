import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";

import type { ApiError } from "../http/client";
import { toastApiError } from "./toastApiError";

export function useApiMutation<TData, TVariables, TOnMutateResult = unknown>(
  options: UseMutationOptions<TData, ApiError, TVariables, TOnMutateResult> & {
    isHandledError?: (error: ApiError) => boolean;
  },
): UseMutationResult<TData, ApiError, TVariables, TOnMutateResult> {
  const { isHandledError, ...mutationOptions } = options;

  return useMutation({
    ...mutationOptions,
    onError: (error, variables, onMutateResult, context) => {
      if (!isHandledError?.(error)) toastApiError(error);
      return mutationOptions.onError?.(
        error,
        variables,
        onMutateResult,
        context,
      );
    },
  });
}
