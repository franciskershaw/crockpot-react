import { useEffect, useState } from "react";
import { Slider as SliderPrimitive } from "radix-ui";

const DEBOUNCE_MS = 300;
const STEP_MINUTES = 5;

export function TimeRangeSlider({
  bounds,
  minTime,
  maxTime,
  onChange,
}: {
  bounds: { minTime: number; maxTime: number };
  minTime: number | undefined;
  maxTime: number | undefined;
  onChange: (minTime: number, maxTime: number) => void;
}) {
  const value: [number, number] = [
    minTime ?? bounds.minTime,
    maxTime ?? bounds.maxTime,
  ];
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);

  if (value[0] !== synced[0] || value[1] !== synced[1]) {
    setSynced(value);
    setDraft(value);
  }

  useEffect(() => {
    if (draft[0] === value[0] && draft[1] === value[1]) return;
    const timeout = setTimeout(() => onChange(draft[0], draft[1]), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [draft]);

  return (
    <div className="flex flex-col gap-2.5 md:gap-3">
      <div className="text-[13px] font-semibold text-ink-secondary md:text-[14px]">
        <span className="md:hidden">
          Cooking time: {draft[0]} – {draft[1]} min
        </span>
        <span className="hidden md:inline">
          Cooking time: {draft[0]} min – {draft[1]} min
        </span>
      </div>
      <SliderPrimitive.Root
        className="relative flex h-4 w-full touch-none items-center select-none md:h-[18px]"
        min={bounds.minTime}
        max={bounds.maxTime}
        step={STEP_MINUTES}
        value={draft}
        onValueChange={(next) => setDraft([next[0], next[1]])}
      >
        <SliderPrimitive.Track className="relative h-[5px] grow rounded-full bg-slider-track">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-green" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block size-4 shrink-0 rounded-full border-2 border-card bg-green shadow-[0_0_0_1px_var(--color-green)] outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
          aria-label="Minimum cooking time"
        />
        <SliderPrimitive.Thumb
          className="block size-4 shrink-0 rounded-full border-2 border-card bg-green shadow-[0_0_0_1px_var(--color-green)] outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
          aria-label="Maximum cooking time"
        />
      </SliderPrimitive.Root>
    </div>
  );
}
