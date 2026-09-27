import { DELAYED_FADE_IN_CLASSES } from "@/lib/styles";

const CATEGORY_COUNT = 4;

export function ShoppingListSkeleton() {
  return (
    <div className={DELAYED_FADE_IN_CLASSES}>
      <output aria-live="polite" className="sr-only">
        Loading your shopping list…
      </output>
      <div aria-hidden="true" className="animate-pulse">
        {Array.from({ length: CATEGORY_COUNT }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-card-shadow px-4.5 py-3.75"
          >
            <div className="size-7 shrink-0 rounded-full bg-muted" />
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="ml-auto h-3.5 w-8 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
