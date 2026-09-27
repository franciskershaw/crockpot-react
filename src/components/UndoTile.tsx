export function UndoTile({
  title,
  canUndo,
  onUndo,
}: {
  title: string;
  canUndo: boolean;
  onUndo: () => void;
}) {
  return (
    <output className="flex min-h-13 items-center justify-between gap-3 rounded-lg border border-dashed border-empty-border pr-2 pl-4 text-[13px] text-ink-body">
      <span className="min-w-0 truncate">Removed {title}</span>
      <button
        type="button"
        disabled={!canUndo}
        onClick={onUndo}
        className="flex min-h-11 shrink-0 cursor-pointer items-center px-2 font-bold text-green disabled:cursor-default disabled:opacity-50"
      >
        Undo
      </button>
    </output>
  );
}
