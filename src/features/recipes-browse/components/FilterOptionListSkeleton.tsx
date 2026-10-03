import { DELAYED_FADE_IN_CLASSES } from "@/lib/styles";
import { cn } from "@/lib/utils";

import { INITIAL_VISIBLE_COUNT } from "./FilterOptionList";

const ROW_WIDTHS = ["w-24", "w-32", "w-20", "w-28", "w-16", "w-24"];

export function FilterOptionListSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-ink-secondary">{label}</h3>
      <output className="sr-only">Loading {label.toLowerCase()}…</output>
      <ul
        aria-hidden="true"
        className={cn("flex animate-pulse flex-col", DELAYED_FADE_IN_CLASSES)}
      >
        {Array.from({ length: INITIAL_VISIBLE_COUNT }).map((_, i) => (
          <li key={i} className="flex h-7 items-center gap-2.5 px-2">
            <div className="size-4.25 shrink-0 rounded-lg bg-muted" />
            <div
              className={cn(
                "h-3.5 rounded bg-muted",
                ROW_WIDTHS[i % ROW_WIDTHS.length],
              )}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
