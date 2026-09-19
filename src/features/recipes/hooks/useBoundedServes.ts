import { useCallback, useState } from "react";

export const MIN_SERVES = 1;
export const MAX_SERVES = 50;

// A local adjustment shouldn't outlive the default it was adjusted from.
export function useBoundedServes(defaultServes: number) {
  const [override, setOverride] = useState<number | null>(null);
  const [syncedDefault, setSyncedDefault] = useState(defaultServes);

  if (defaultServes !== syncedDefault) {
    setSyncedDefault(defaultServes);
    setOverride(null);
  }

  const serves = override ?? defaultServes;

  const adjust = useCallback(
    (delta: number) =>
      setOverride((current) =>
        Math.max(
          MIN_SERVES,
          Math.min(MAX_SERVES, (current ?? defaultServes) + delta),
        ),
      ),
    [defaultServes],
  );
  const reset = useCallback(() => setOverride(null), []);

  return {
    serves,
    adjust,
    reset,
    canDecrease: serves > MIN_SERVES,
    canIncrease: serves < MAX_SERVES,
  };
}
