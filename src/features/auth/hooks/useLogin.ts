import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { login } from "../data/api";
import { isShownOnAuthForm } from "../utils/authErrors";
import { startSession } from "../utils/startSession";

export function useLogin() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { accessToken } = await login(credentials);
      await startSession(queryClient, accessToken);
    },
    isHandledError: isShownOnAuthForm,
  });
}
