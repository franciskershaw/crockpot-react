export function RecipeCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex animate-pulse flex-col overflow-hidden rounded-lg border border-border bg-card shadow-[0_2px_0_var(--color-card-shadow)]"
    >
      <div className="h-45 w-full bg-muted" />
      <div className="flex flex-col gap-2 px-4 pt-3.5 pb-4.5">
        <div className="h-[21px] w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="h-5 w-1/3 rounded-full bg-muted" />
      </div>
    </div>
  );
}
