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
    <output className="flex min-h-13 flex-col items-center justify-center rounded-lg border border-dashed border-empty-border px-4 text-center text-[13px] text-ink-body">
      <span className="max-w-full truncate">Removed {title}</span>
      <button
        type="button"
        disabled={!canUndo}
        onClick={onUndo}
        className="-my-1.5 flex min-h-11 shrink-0 cursor-pointer items-center px-2 font-bold text-green disabled:cursor-default disabled:opacity-50"
      >
        Undo
      </button>
    </output>
  );
}
