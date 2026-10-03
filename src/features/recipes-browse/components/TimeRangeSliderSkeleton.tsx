import { DELAYED_FADE_IN_CLASSES } from "@/lib/styles";
import { cn } from "@/lib/utils";

export function TimeRangeSliderSkeleton() {
  return (
    <div>
      <output className="sr-only">Loading time range…</output>
      <div
        aria-hidden="true"
        className={cn(
          "flex animate-pulse flex-col gap-2.5 md:gap-3",
          DELAYED_FADE_IN_CLASSES,
        )}
      >
        <div className="h-4 w-48 rounded bg-muted md:h-5" />
        <div className="h-4 rounded-full bg-muted md:h-4.5" />
      </div>
    </div>
  );
}
