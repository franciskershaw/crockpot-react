import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "../http/client";

export function useApiMutation<TData, TVariables, TOnMutateResult = unknown>(
  options: UseMutationOptions<TData, ApiError, TVariables, TOnMutateResult>,
): UseMutationResult<TData, ApiError, TVariables, TOnMutateResult> {
  return useMutation({
    ...options,
    onError: (error, variables, onMutateResult, context) => {
      toast.error(error instanceof ApiError ? error.message : "request failed");
      return options.onError?.(error, variables, onMutateResult, context);
    },
  });
}
