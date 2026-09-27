import type { MutationKey, QueryClient, QueryKey } from "@tanstack/react-query";

// Called from onSettled, while the settling mutation still counts as in flight.
export function refetchAfterLastMutation(
  queryClient: QueryClient,
  mutationKey: MutationKey,
  queryKey: QueryKey,
) {
  if (queryClient.isMutating({ mutationKey }) > 1) return;
  return queryClient.invalidateQueries({ queryKey });
}
