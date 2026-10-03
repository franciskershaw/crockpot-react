import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { confirmEmail, login } from "../data/api";
import { isShownOnAuthForm } from "../utils/authErrors";
import { startSession } from "../utils/startSession";

// Resolves true once signed in, false when the email is confirmed but the user must sign in by hand.
export function useConfirmAndSignIn(email: string, password?: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: async (code: string) => {
      await confirmEmail({ email, code });
      if (!password) return false;
      try {
        const { accessToken } = await login({ email, password });
        await startSession(queryClient, accessToken);
        return true;
      } catch {
        return false;
      }
    },
    isHandledError: isShownOnAuthForm,
  });
}
