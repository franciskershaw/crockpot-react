import { setAccessToken } from "@/lib/http/tokenStore";
import type { QueryClient } from "@tanstack/react-query";

import { fetchMe } from "../data/api";
import { AUTH_SESSION_QUERY_KEY } from "../data/queryKeys";
import { removeNonSessionQueries } from "./endSession";

// The one way an in-app sign-in starts. Removal comes before the session write so signed-in pages can't mount and fetch in between.
export async function startSession(
  queryClient: QueryClient,
  accessToken: string,
): Promise<void> {
  setAccessToken(accessToken);
  const user = await fetchMe().catch((error: unknown) => {
    setAccessToken(null);
    throw error;
  });
  removeNonSessionQueries(queryClient);
  queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, user);
}
