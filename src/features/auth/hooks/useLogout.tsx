import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { logout } from "../data/api";
import { endSession } from "../utils/endSession";

export function useLogout() {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success("Logged out");
    },
    onSettled: () => {
      endSession(queryClient);
    },
  });
}
