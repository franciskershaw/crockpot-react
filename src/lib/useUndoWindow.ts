import { useEffect, useState } from "react";

export const UNDO_WINDOW_MS = 5000;

// Holds the last removed item for UNDO_WINDOW_MS. Undone items stay until the timer clears them,
// so their slot survives the tick before the optimistic re-add lands.
export function useUndoWindow<T extends object>() {
  const [removed, setRemoved] = useState<(T & { undone?: boolean }) | null>(
    null,
  );

  useEffect(() => {
    if (!removed) return;
    const timer = setTimeout(() => setRemoved(null), UNDO_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [removed]);

  return {
    removed,
    start: (item: T) => setRemoved(item),
    forget: (item: T) =>
      setRemoved((current) => (current === item ? null : current)),
    markUndone: () =>
      setRemoved((current) => current && { ...current, undone: true }),
  };
}
