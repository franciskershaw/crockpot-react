import { useEffect } from "react";
import { useSentinelInView } from "@/lib/useSentinelInView";

export function useLoadMoreOnSentinel({
  hasNextPage,
  isFetching,
  isError,
  changesInFlight = 0,
  loadMore,
}: {
  hasNextPage: boolean;
  isFetching: boolean;
  isError: boolean;
  changesInFlight?: number;
  loadMore: () => void;
}) {
  const { sentinelRef, inView } = useSentinelInView();

  // After a failed fetch only the caller's retry tries again, never the sentinel.
  useEffect(() => {
    if (!inView || !hasNextPage || isError) return;
    loadMore();
  }, [inView, hasNextPage, isFetching, isError, changesInFlight, loadMore]);

  return sentinelRef;
}
