import { useCallback, useEffect, useRef, useState } from "react";

import type { Removal } from "./undoSlots";

export const UNDO_WINDOW_MS = 4000;

type NewRemoval<T> = Pick<Removal<T>, "key" | "item" | "anchorKey" | "index">;

interface Countdown {
  remaining: number;
  startedAt: number;
  holds: number;
  timer?: ReturnType<typeof setTimeout>;
}

// Each removal counts down and pauses on its own; one never changes another's time.
export function useUndoQueue<T>() {
  const [removals, setRemovals] = useState<Removal<T>[]>([]);
  const [pausedKeys, setPausedKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const countdowns = useRef(new Map<string, Countdown>());
  const mounted = useRef(false);

  const setPaused = useCallback((key: string, paused: boolean) => {
    setPausedKeys((current) => {
      const next = new Set(current);
      if (paused) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);
  const forget = useCallback(
    (key: string) => {
      clearTimeout(countdowns.current.get(key)?.timer);
      countdowns.current.delete(key);
      setPaused(key, false);
      setRemovals((current) =>
        current.filter((removal) => removal.key !== key),
      );
    },
    [setPaused],
  );

  const run = useCallback(
    (key: string, countdown: Countdown) => {
      if (!mounted.current) return;
      countdown.startedAt = Date.now();
      countdown.timer = setTimeout(() => forget(key), countdown.remaining);
    },
    [forget],
  );

  // Hidden or unmounted, every countdown stops; shown again, the unheld ones carry on.
  useEffect(() => {
    mounted.current = true;
    const all = countdowns.current;
    all.forEach((countdown, key) => {
      if (countdown.holds === 0 && !countdown.timer) run(key, countdown);
    });
    return () => {
      mounted.current = false;
      all.forEach(stop);
    };
  }, [run]);

  const update = useCallback(
    (key: string, change: Partial<Removal<T>>) =>
      setRemovals((current) =>
        current.map((removal) =>
          removal.key === key ? { ...removal, ...change } : removal,
        ),
      ),
    [],
  );

  const canUndo = (key: string) =>
    removals.some((r) => r.key === key && r.settled && !r.undone);

  return {
    removals,
    canUndo,
    // The removal to put back, marked undone so it can't be put back twice.
    claimUndo: (key: string) => {
      if (!canUndo(key)) return;
      update(key, { undone: true });
      return removals.find((r) => r.key === key);
    },
    isPaused: (key: string) => pausedKeys.has(key),
    pause: useCallback(
      (key: string) => {
        const countdown = countdowns.current.get(key);
        if (!countdown) return;
        countdown.holds += 1;
        if (countdown.holds > 1) return;
        stop(countdown);
        setPaused(key, true);
      },
      [setPaused],
    ),
    resume: useCallback(
      (key: string) => {
        const countdown = countdowns.current.get(key);
        if (!countdown || countdown.holds === 0) return;
        countdown.holds -= 1;
        if (countdown.holds > 0) return;
        run(key, countdown);
        setPaused(key, false);
      },
      [run, setPaused],
    ),
    start: useCallback(
      (removal: NewRemoval<T>) => {
        const previous = countdowns.current.get(removal.key);
        if (previous) stop(previous);
        const countdown = { remaining: UNDO_WINDOW_MS, startedAt: 0, holds: 0 };
        countdowns.current.set(removal.key, countdown);
        run(removal.key, countdown);
        setPaused(removal.key, false);
        setRemovals((current) => [
          ...current.filter(({ key }) => key !== removal.key),
        ]);
      },
      [run, setPaused],
    ),
    settle: useCallback(
      (key: string) => update(key, { settled: true }),
      [update],
    ),
    forget,
  };
}

function stop(countdown: Countdown) {
  if (!countdown.timer) return;
  clearTimeout(countdown.timer);
  countdown.timer = undefined;
  countdown.remaining -= Date.now() - countdown.startedAt;
}
