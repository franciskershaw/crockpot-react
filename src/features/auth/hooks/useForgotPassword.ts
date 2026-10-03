import { useApiMutation } from "@/lib/tanstack/useApiMutation";

import { forgotPassword } from "../data/api";
import { isShownOnAuthForm } from "../utils/authErrors";

export function useForgotPassword() {
  return useApiMutation({
    mutationFn: forgotPassword,
    isHandledError: isShownOnAuthForm,
  });
}
