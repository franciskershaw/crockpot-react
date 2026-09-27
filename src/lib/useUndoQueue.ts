import { useCallback, useEffect, useRef, useState } from "react";

import type { Removal } from "./undoSlots";

export const UNDO_WINDOW_MS = 5000;

type NewRemoval<T> = Pick<Removal<T>, "key" | "item" | "anchorKey" | "index">;

// Every removal restarts one shared window, so a later removal only ever extends
// an earlier one's chance to undo; they all clear together when it ends.
export function useUndoQueue<T>() {
  const [removals, setRemovals] = useState<Removal<T>[]>([]);
  const [generation, setGeneration] = useState(0);
  const [pauses, setPauses] = useState(0);
  const remaining = useRef(UNDO_WINDOW_MS);
  const restart = useRef(false);
  const paused = pauses > 0;

  useEffect(() => {
    if (restart.current) {
      remaining.current = UNDO_WINDOW_MS;
      restart.current = false;
    }
    if (generation === 0 || paused) return;
    const startedAt = Date.now();
    const timer = setTimeout(() => setRemovals([]), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [generation, paused]);

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
    generation,
    paused,
    pause: useCallback(() => setPauses((current) => current + 1), []),
    resume: useCallback(
      () => setPauses((current) => Math.max(0, current - 1)),
      [],
    ),
    start: useCallback((removal: NewRemoval<T>) => {
      setRemovals((current) => [
        ...current.filter(({ key }) => key !== removal.key),
        { ...removal, settled: false, undone: false },
      ]);
      restart.current = true;
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
