export function RecipeCardPlaceholder({
  meta,
  className,
}: {
  meta: string;
  className?: string;
}) {
  return (
    <div
      className={`w-60 rounded-xl bg-card p-3 shadow-lg ring-1 ring-border/50 ${className ?? ""}`}
    >
      <div className="aspect-[4/3] rounded-lg bg-muted" />
      <p className="mt-3 font-display">Recipe name</p>
      <p className="text-sm text-muted-foreground">{meta}</p>
    </div>
  );
}
