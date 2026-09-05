import { useMutation, useQueryClient } from "@tanstack/react-query";

import { setAccessToken } from "../../../lib/http/tokenStore";
import { logout } from "../api";
import { AUTH_SESSION_QUERY_KEY } from "../components/AuthContext";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      setAccessToken(null);
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null);
    },
  });
}
