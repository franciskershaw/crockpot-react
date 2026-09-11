import { setAccessToken } from "@/lib/http/tokenStore";
import { useApiMutation } from "@/lib/Tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { logout } from "../api";
import { AUTH_SESSION_QUERY_KEY } from "../components/AuthContext";

export function useLogout() {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success("Logged out");
    },
    onSettled: () => {
      setAccessToken(null);
      // Order matters: clear() first would rebuild this query with no observer attached, so the write below would go unseen until something unrelated forced a re-render.
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null);
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== AUTH_SESSION_QUERY_KEY[0],
      });
    },
  });
}
