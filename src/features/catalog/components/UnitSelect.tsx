import {
  Select,
  SelectContent,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";

import type { Unit } from "../data/types";

const NO_UNIT = "none";

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

export function UnitSelect({
  units,
  unitId,
  onChange,
}: {
  units: Unit[];
  unitId: string | null;
  onChange: (unitId: string | null) => void;
}) {
  const selected = units.find((unit) => unit.id === unitId);

  return (
    <Select
      value={unitId ?? NO_UNIT}
      onValueChange={(value) => onChange(value === NO_UNIT ? null : value)}
    >
      <SelectTrigger
        aria-label="Unit"
        className="mx-0.5 h-6! cursor-pointer gap-1 rounded-full border-0 px-2 text-sm text-ink-body shadow-none focus-visible:ring-0 data-[state=open]:bg-chip [&_svg]:size-3.5! [&_svg]:opacity-100 [&_svg]:transition-transform data-[state=open]:[&_svg]:rotate-180"
      >
        <SelectValue>
          {selected ? (
            selected.abbreviation
          ) : (
            <>
              <span aria-hidden className="md:hidden">
                –
              </span>
              <span className="max-md:sr-only">No unit</span>
            </>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        position="popper"
        align="start"
        className="min-w-42 rounded-lg border-border bg-card shadow-popover"
      >
        <UnitOption value={NO_UNIT} name="No unit" />
        {units.length > 0 && (
          <SelectSeparator className="mx-1 bg-card-shadow" />
        )}
        {units.map((unit) => (
          <UnitOption
            key={unit.id}
            value={unit.id}
            name={unit.name}
            abbreviation={unit.abbreviation}
          />
        ))}
      </SelectContent>
    </Select>
  );
}
