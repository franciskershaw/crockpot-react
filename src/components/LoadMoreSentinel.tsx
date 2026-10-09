import type { Ref } from "react";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";

export function LoadMoreSentinel({
  sentinelRef,
  hasNextPage,
  isError,
  isFetching,
  onRetry,
  className,
}: {
  sentinelRef: Ref<HTMLDivElement>;
  hasNextPage: boolean;
  isError: boolean;
  isFetching: boolean;
  onRetry: () => void;
  className?: string;
}) {
  if (!hasNextPage) return null;

  if (!isError || isFetching) {
    return <div ref={sentinelRef} className={cn("h-1", className)} />;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 py-6 text-sm text-muted-foreground",
        className,
      )}
    >
      <p>Couldn't load more recipes.</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
