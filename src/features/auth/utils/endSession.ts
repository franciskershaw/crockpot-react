import { setAccessToken } from "@/lib/http/tokenStore";
import type { QueryClient } from "@tanstack/react-query";

import { AUTH_SESSION_QUERY_KEY } from "../data/queryKeys";

// The one way a session ends. Returns false when there was no signed-in user to end.
export function endSession(queryClient: QueryClient): boolean {
  setAccessToken(null);
  if (!queryClient.getQueryData(AUTH_SESSION_QUERY_KEY)) return false;
  // Order matters: clear() first would rebuild the session query with no observer attached, so the write below would go unseen until something unrelated forced a re-render.
  queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null);
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== AUTH_SESSION_QUERY_KEY[0],
  });
  return true;
}
