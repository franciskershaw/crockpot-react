import { DELAYED_FADE_IN_CLASSES } from "@/lib/styles";

import { LoadFailedLine } from "./LoadFailedLine";

const CARD_ROWS = [3, 2];

export function RegularsPlaceholder({
  isError,
  onRetry,
}: {
  isError: boolean;
  onRetry: () => void;
}) {
  if (isError) return <LoadFailedLine what="regulars" onRetry={onRetry} />;

  return (
    <div className={DELAYED_FADE_IN_CLASSES}>
      <output aria-live="polite" className="sr-only">
        Loading your regulars…
      </output>
      <div
        aria-hidden="true"
        className="flex animate-pulse flex-col gap-3 px-4.5 pt-3.5 pb-3"
      >
        {CARD_ROWS.map((rows, i) => (
          <div
            key={i}
            className="rounded-[10px] border border-border px-3.5 pt-3 pb-2"
          >
            <div className="flex items-center gap-2.5 pb-2">
              <div className="size-6.5 shrink-0 rounded-md bg-muted" />
              <div className="h-4 w-1/4 rounded bg-muted" />
            </div>
            {Array.from({ length: rows }).map((_, j) => (
              <div key={j} className="flex items-center gap-2.25 py-2">
                <div className="size-4.75 shrink-0 rounded-sm bg-muted" />
                <div className="h-3.5 w-2/5 rounded bg-muted" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
