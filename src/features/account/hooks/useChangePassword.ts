import { startSession } from "@/features/auth/utils/startSession";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { changePassword } from "../data/api";
import { changePasswordFieldError } from "../utils/accountErrors";

export function useChangePassword() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: async (input: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const { accessToken } = await changePassword(input);
      await startSession(queryClient, accessToken);
    },
    isHandledError: (error) => changePasswordFieldError(error) !== null,
    onSuccess: () => {
      toast.success("Password changed");
    },
  });
}
