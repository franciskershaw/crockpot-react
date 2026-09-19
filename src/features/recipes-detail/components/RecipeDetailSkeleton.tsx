// Invisible for the first 200ms so a fast load never shows it, then fades in.
export function RecipeDetailSkeleton() {
  return (
    <div className="animate-in fade-in delay-200 duration-150 fill-mode-backwards">
      <div className="animate-pulse">
        <output aria-live="polite" className="sr-only">
          Loading recipe…
        </output>

        <div aria-hidden="true">
          <div className="relative h-105 w-full bg-muted md:h-120">
            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-6">
              <div className="mb-3 h-5 w-24 rounded-full bg-muted-foreground/15" />
              <div className="mb-4 h-9 w-2/3 rounded bg-muted-foreground/15 md:h-13 md:w-1/2" />
              <div className="flex flex-wrap gap-4">
                <div className="h-4 w-20 rounded bg-muted-foreground/15" />
                <div className="h-4 w-24 rounded bg-muted-foreground/15" />
                <div className="h-4 w-28 rounded bg-muted-foreground/15" />
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 py-10">
            <div className="mx-auto h-5 w-2/3 rounded bg-muted md:w-1/2" />
          </div>

          <div className="mx-auto max-w-7xl px-6 py-5">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
              <div className="space-y-3 md:col-span-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-4 w-full rounded bg-muted" />
                ))}
              </div>
              <div className="space-y-3 md:col-span-8">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 w-full rounded bg-muted" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
