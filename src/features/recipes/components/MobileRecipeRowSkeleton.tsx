export function MobileRecipeRowSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex min-h-18 animate-pulse items-center gap-3 rounded-lg border border-border bg-card p-2"
    >
      <div className="size-14 shrink-0 rounded-md bg-muted" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/4 rounded bg-muted" />
      </div>
      <div className="h-8 w-14 shrink-0 rounded-full bg-muted" />
    </div>
  );
}
