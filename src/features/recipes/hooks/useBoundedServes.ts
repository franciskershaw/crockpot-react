import { useCallback, useState } from "react";

import { RECIPE_LIMITS } from "../utils/recipeLimits";

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
          RECIPE_LIMITS.serves.min,
          Math.min(
            RECIPE_LIMITS.serves.max,
            (current ?? defaultServes) + delta,
          ),
        ),
      ),
    [defaultServes],
  );
  const reset = useCallback(() => setOverride(null), []);

  return {
    serves,
    adjust,
    reset,
    canDecrease: serves > RECIPE_LIMITS.serves.min,
    canIncrease: serves < RECIPE_LIMITS.serves.max,
  };
}
