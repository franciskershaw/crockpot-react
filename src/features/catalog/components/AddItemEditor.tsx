import { useState } from "react";
import type { Item, Unit } from "@/features/catalog/data/types";
import { focusAtEnd } from "@/lib/focusAtEnd";
import { isQuantityInput, parseQuantity } from "@/lib/quantity";
import { cn } from "@/lib/utils";
import { Check, Loader2, X } from "lucide-react";

import { UnitSelect } from "./UnitSelect";

function Divider() {
  return <span aria-hidden className="h-3.5 w-px shrink-0 bg-border" />;
}

export function AddItemEditor({
  item,
  allowedUnits,
  isPending,
  isError,
  onConfirm,
  onCancel,
  confirmLabel = "Add to list",
}: {
  item: Item;
  allowedUnits: Unit[];
  isPending: boolean;
  isError: boolean;
  onConfirm: (quantity: number, unitId: string | null) => void;
  onCancel: () => void;
  confirmLabel?: string;
}) {
  const [quantity, setQuantity] = useState("1");
  const [unitId, setUnitId] = useState<string | null>(null);
  const parsed = parseQuantity(quantity);
  const canConfirm = parsed !== null && !isPending;

  const confirm = () => {
    if (canConfirm) onConfirm(parsed, unitId);
  };

  return (
    <div className="flex h-10 items-center gap-1.75">
      <span className="min-w-0 truncate text-[15px] font-semibold">
        {item.name}
      </span>
      <span aria-hidden className="text-separator-muted">
        ×
      </span>
      <div
        className={cn(
          "flex h-7.5 shrink-0 items-center rounded-full border bg-card shadow-control transition-colors",
          isError ? "border-rust-icon" : "border-editor-border",
        )}
      >
        <button
          type="button"
          aria-label="Cancel"
          onClick={onCancel}
          className="flex h-full w-7 cursor-pointer items-center justify-center text-ink-subtle"
        >
          <X size={13} strokeWidth={2.4} />
        </button>
        <Divider />
        <input
          ref={focusAtEnd}
          aria-label="Quantity"
          aria-invalid={isError}
          inputMode="decimal"
          value={quantity}
          onChange={(event) => {
            if (isQuantityInput(event.target.value)) {
              setQuantity(event.target.value);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              confirm();
            } else if (event.key === "Escape") {
              event.preventDefault();
              onCancel();
            }
          }}
          className="w-11 bg-transparent text-center text-sm font-semibold tabular-nums caret-green outline-none"
        />
        <Divider />
        <UnitSelect units={allowedUnits} unitId={unitId} onChange={setUnitId} />
        <Divider />
        {isPending ? (
          <output
            aria-label="Adding"
            className="flex h-full w-7 items-center justify-center text-green"
          >
            <Loader2 size={12} className="animate-spin" />
          </output>
        ) : (
          <button
            type="button"
            aria-label={confirmLabel}
            onClick={confirm}
            disabled={!canConfirm}
            className="flex h-full w-7 cursor-pointer items-center justify-center text-green disabled:cursor-not-allowed disabled:text-faint-border"
          >
            <Check size={14} strokeWidth={2.6} />
          </button>
        )}
      </div>
    </div>
  );
}
