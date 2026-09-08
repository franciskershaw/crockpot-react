import { setAccessToken } from "@/lib/http/tokenStore";
import { useApiMutation } from "@/lib/Tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

import { logout } from "../api";
import { AUTH_SESSION_QUERY_KEY } from "../components/AuthContext";

export function useLogout() {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: logout,
    onSettled: () => {
      setAccessToken(null);
      queryClient.clear();
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null);
    },
  });
}
