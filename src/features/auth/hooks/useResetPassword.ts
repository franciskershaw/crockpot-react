import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { resetPassword } from "../data/api";
import { isShownOnAuthForm } from "../utils/authErrors";
import { startSession } from "../utils/startSession";

export function useResetPassword() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: async (input: { token: string; newPassword: string }) => {
      const { accessToken } = await resetPassword(input);
      await startSession(queryClient, accessToken);
    },
    isHandledError: isShownOnAuthForm,
    // Hook-level, not per-mutate: signing in unmounts the page before a per-call callback would run.
    onSuccess: () => {
      toast.success(
        "Password updated. We've signed you out on your other devices.",
      );
    },
  });
}
