import { endSession } from "@/features/auth/utils/endSession";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { deleteAccount } from "../data/api";
import { isInvalidPassword } from "../utils/accountErrors";

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useApiMutation({
    mutationFn: (body: { password?: string }) => deleteAccount(body),
    isHandledError: isInvalidPassword,
    // Hook-level, not per-mutate: ending the session unmounts the page before a per-call callback would run.
    onSuccess: () => {
      endSession(queryClient);
      navigate("/", { replace: true });
      toast.success("Your account has been deleted.");
    },
  });
}
