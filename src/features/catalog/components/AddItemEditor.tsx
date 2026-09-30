import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Item, Unit } from "@/features/catalog/data/types";
import { focusAtEnd } from "@/lib/focusAtEnd";
import { isQuantityInput, parseQuantity } from "@/lib/quantity";
import { cn } from "@/lib/utils";
import { Check, Loader2, X } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";

const NO_UNIT = "none";

function Divider() {
  return <span aria-hidden className="h-3.5 w-px shrink-0 bg-border" />;
}

function UnitOption({
  value,
  name,
  abbreviation,
}: {
  value: string;
  name: string;
  abbreviation?: string;
}) {
  return (
    <SelectPrimitive.Item
      value={value}
      className="relative flex h-8.5 cursor-pointer items-center rounded-[5px] pr-2.5 pl-5.5 text-sm outline-none select-none data-highlighted:bg-chip"
    >
      <SelectPrimitive.ItemIndicator className="absolute left-1.5 flex">
        <Check size={13} strokeWidth={2.4} className="text-green" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{name}</SelectPrimitive.ItemText>
      {abbreviation && (
        <span className="ml-auto pl-4 text-xs text-icon-muted">
          {abbreviation}
        </span>
      )}
    </SelectPrimitive.Item>
  );
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
  const [unitId, setUnitId] = useState(NO_UNIT);
  const parsed = parseQuantity(quantity);
  const canConfirm = parsed !== null && !isPending;
  const selectedUnit = allowedUnits.find((unit) => unit.id === unitId);

  const confirm = () => {
    if (canConfirm) onConfirm(parsed, unitId === NO_UNIT ? null : unitId);
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
        <Select value={unitId} onValueChange={setUnitId}>
          <SelectTrigger
            aria-label="Unit"
            className="mx-0.5 h-6! cursor-pointer gap-1 rounded-full border-0 px-2 text-sm text-ink-body shadow-none focus-visible:ring-0 data-[state=open]:bg-chip [&_svg]:size-3.5! [&_svg]:opacity-100 [&_svg]:transition-transform data-[state=open]:[&_svg]:rotate-180"
          >
            <SelectValue>{selectedUnit?.abbreviation ?? "No unit"}</SelectValue>
          </SelectTrigger>
          <SelectContent
            position="popper"
            align="start"
            className="min-w-42 rounded-lg border-border bg-card shadow-popover"
          >
            <UnitOption value={NO_UNIT} name="No unit" />
            {allowedUnits.length > 0 && (
              <SelectSeparator className="mx-1 bg-card-shadow" />
            )}
            {allowedUnits.map((unit) => (
              <UnitOption
                key={unit.id}
                value={unit.id}
                name={unit.name}
                abbreviation={unit.abbreviation}
              />
            ))}
          </SelectContent>
        </Select>
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
