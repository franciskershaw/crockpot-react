import { useApiMutation } from "@/lib/tanstack/useApiMutation";

import { register } from "../data/api";
import { isShownOnAuthForm } from "../utils/authErrors";

export function useRegister() {
  return useApiMutation({
    mutationFn: register,
    isHandledError: isShownOnAuthForm,
  });
}
