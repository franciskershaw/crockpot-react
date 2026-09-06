import { useQueryClient } from "@tanstack/react-query";

import { setAccessToken } from "../../../lib/http/tokenStore";
import { useApiMutation } from "../../../lib/Tanstack/useApiMutation";
import { logout } from "../api";
import { AUTH_SESSION_QUERY_KEY } from "../components/AuthContext";

export function useLogout() {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: logout,
    onSettled: () => {
      setAccessToken(null);
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null);
    },
  });
}
