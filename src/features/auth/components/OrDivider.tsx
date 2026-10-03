export function OrDivider() {
  return (
    <div
      aria-hidden="true"
      className="my-6 flex items-center gap-2 text-[11px] font-semibold tracking-[0.06em] text-icon-muted uppercase md:gap-2.5"
    >
      <span className="h-px flex-1 bg-input" />
      or
      <span className="h-px flex-1 bg-input" />
    </div>
  );
}
