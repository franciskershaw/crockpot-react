import { UNDO_WINDOW_MS } from "@/lib/useUndoQueue";

export function UndoTile({
  title,
  canUndo,
  onUndo,
  paused = false,
  countdownKey,
  onPause,
  onResume,
}: {
  title: string;
  canUndo: boolean;
  onUndo: () => void;
  paused?: boolean;
  countdownKey?: number;
  onPause?: () => void;
  onResume?: () => void;
}) {
  return (
    <output
      onPointerEnter={onPause}
      onPointerLeave={onResume}
      className="relative flex min-h-13 flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-empty-border px-4 text-center text-[13px] text-ink-body"
    >
      <span className="max-w-full truncate">Removed {title}</span>
      <button
        type="button"
        disabled={!canUndo}
        onClick={onUndo}
        onFocus={onPause}
        onBlur={onResume}
        className="-my-1.5 flex min-h-11 shrink-0 cursor-pointer items-center px-2 font-bold text-green disabled:cursor-default disabled:opacity-50"
      >
        Undo
      </button>
      <span
        key={countdownKey}
        data-testid="undo-countdown"
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left animate-undo-countdown bg-green/50 motion-reduce:[animation-timing-function:steps(5,end)]"
        style={{
          animationDuration: `${UNDO_WINDOW_MS}ms`,
          animationPlayState: paused ? "paused" : "running",
        }}
      />
    </output>
  );
}
