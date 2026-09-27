import { useEffect, useRef } from "react";
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
  // Unmounting fires no leave or blur, so any hold still open is released here.
  const holds = useRef(0);
  const release = useRef(onResume);

  useEffect(() => {
    release.current = onResume;
  }, [onResume]);

  useEffect(
    () => () => {
      for (; holds.current > 0; holds.current -= 1) release.current?.();
    },
    [],
  );

  const hold = () => {
    holds.current += 1;
    onPause?.();
  };
  const letGo = () => {
    if (holds.current === 0) return;
    holds.current -= 1;
    onResume?.();
  };

  return (
    <output
      onPointerEnter={hold}
      onPointerLeave={letGo}
      className="relative flex min-h-13 flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-empty-border px-4 text-center text-[13px] text-ink-body"
    >
      <span className="max-w-full truncate">Removed {title}</span>
      <button
        type="button"
        disabled={!canUndo}
        onClick={onUndo}
        onFocus={hold}
        onBlur={letGo}
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
