import { useCallback, useEffect, useState } from "react";

import type { Removal } from "./undoSlots";

export const UNDO_WINDOW_MS = 5000;

type NewRemoval<T> = Pick<Removal<T>, "key" | "item" | "anchorKey" | "index">;

// Every removal restarts one shared window, so a later removal only ever extends
// an earlier one's chance to undo; they all clear together when it ends.
export function useUndoQueue<T>() {
  const [removals, setRemovals] = useState<Removal<T>[]>([]);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    if (generation === 0) return;
    const timer = setTimeout(() => setRemovals([]), UNDO_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [generation]);

  const update = useCallback(
    (key: string, change: Partial<Removal<T>>) =>
      setRemovals((current) =>
        current.map((removal) =>
          removal.key === key ? { ...removal, ...change } : removal,
        ),
      ),
    [],
  );

  return {
    removals,
    start: useCallback((removal: NewRemoval<T>) => {
      setRemovals((current) => [
        ...current.filter(({ key }) => key !== removal.key),
        { ...removal, settled: false, undone: false },
      ]);
      setGeneration((current) => current + 1);
    }, []),
    settle: useCallback(
      (key: string) => update(key, { settled: true }),
      [update],
    ),
    forget: useCallback(
      (key: string) =>
        setRemovals((current) =>
          current.filter((removal) => removal.key !== key),
        ),
      [],
    ),
    markUndone: useCallback(
      (key: string) => update(key, { undone: true }),
      [update],
    ),
  };
}
