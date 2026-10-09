import { useState } from "react";
import { Minus, Plus } from "lucide-react";

const STEP_BUTTON_CLASSES =
  "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-pill-border text-ink-body disabled:cursor-not-allowed disabled:opacity-40";

export function NumberStepper({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const commit = () => {
    if (draft === null) return;
    if (draft !== "") onChange(clamp(Number(draft)));
    setDraft(null);
  };

  return (
    // Ring only while typing, not when a ± button takes focus.
    <div className="flex h-12 items-center justify-between rounded-field border-[1.5px] border-border bg-card px-2.5 transition-[border-color,box-shadow] has-[input:focus]:border-green has-[input:focus]:ring-[3px] has-[input:focus]:ring-green/14">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - step))}
        className={STEP_BUTTON_CLASSES}
      >
        <Minus size={13} strokeWidth={2.2} />
      </button>
      <input
        aria-label={label}
        inputMode="numeric"
        value={draft ?? String(value)}
        onChange={(event) => {
          if (/^\d{0,4}$/.test(event.target.value)) {
            setDraft(event.target.value);
          }
        }}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }
        }}
        className="w-[4ch] bg-transparent text-center text-lg font-bold tabular-nums caret-green outline-none"
      />
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + step))}
        className={STEP_BUTTON_CLASSES}
      >
        <Plus size={13} strokeWidth={2.2} />
      </button>
    </div>
  );
}
