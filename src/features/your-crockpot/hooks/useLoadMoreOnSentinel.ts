import { useEffect, useRef } from "react";
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
  // After a failed fetch (a page, or refreshing a stale list), only scrolling away and back retries it.
  const leftViewSinceLastLoad = useRef(false);

  useEffect(() => {
    if (!inView) leftViewSinceLastLoad.current = true;
  }, [inView]);

  useEffect(() => {
    if (!inView || !hasNextPage) return;
    if (isError && !leftViewSinceLastLoad.current) return;
    leftViewSinceLastLoad.current = false;
    loadMore();
  }, [inView, hasNextPage, isFetching, isError, changesInFlight, loadMore]);

  return sentinelRef;
}
