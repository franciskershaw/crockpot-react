import { AUTH_SESSION_QUERY_KEY } from "@/features/auth/data/queryKeys";
import type { ApiError } from "@/lib/http/client";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateName } from "../data/api";

export const isInvalidName = (error: ApiError) =>
  error.status === 400 && error.message === "invalid_name";

export function useUpdateName() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (name: string) => updateName(name),
    isHandledError: isInvalidName,
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, user);
      toast.success("Name updated");
    },
  });
}
