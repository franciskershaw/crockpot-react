import { useState } from "react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Unit } from "@/features/catalog/data/types";
import { Command } from "cmdk";
import { Check, ChevronDown, X } from "lucide-react";

export function UnitMultiSelect({
  id,
  units,
  value,
  onChange,
}: {
  id?: string;
  units: Unit[];
  value: string[];
  onChange: (unitIds: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const unitsById = new Map(units.map((unit) => [unit.id, unit]));
  const picked = value.flatMap((unitId) => {
    const unit = unitsById.get(unitId);
    return unit ? [unit] : [];
  });

  const toggle = (unitId: string) =>
    onChange(
      value.includes(unitId)
        ? value.filter((pickedId) => pickedId !== unitId)
        : [...value, unitId],
    );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>
        <div className="flex min-h-10 flex-wrap items-center gap-1 rounded-[7px] border-[1.5px] border-border bg-card py-1 pr-2 pl-1.5 transition-[border-color,box-shadow] focus-within:border-green focus-within:ring-[3px] focus-within:ring-green/14">
          <span data-testid="unit-chips" className="contents">
            {picked.map((unit) => (
              <span
                key={unit.id}
                className="flex h-6 items-center gap-0.5 rounded-full bg-chip pr-0.5 pl-2.5 text-[13px]"
              >
                {unit.name}
                <button
                  type="button"
                  aria-label={`Remove ${unit.name}`}
                  onClick={() => toggle(unit.id)}
                  className="flex size-5 cursor-pointer items-center justify-center rounded-full text-ink-subtle hover:bg-card-shadow"
                >
                  <X size={11} strokeWidth={2.4} />
                </button>
              </span>
            ))}
          </span>
          <PopoverTrigger asChild>
            <button
              id={id}
              type="button"
              className="flex h-7.5 min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 pl-1.5 text-left text-sm text-icon-muted outline-none"
            >
              {picked.length === 0 ? "Any unit" : null}
              <ChevronDown
                size={16}
                strokeWidth={2}
                className="ml-auto shrink-0 text-ink-subtle"
              />
            </button>
          </PopoverTrigger>
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-(--radix-popover-trigger-width) rounded-lg border-border bg-card p-1 shadow-[0_12px_30px_rgba(35,32,27,0.16)]"
      >
        <Command loop label="Filter units">
          <Command.Input
            placeholder="Filter units"
            className="mb-1 h-8.5 w-full rounded-[5px] border border-border bg-card px-2.5 text-sm outline-none placeholder:text-icon-muted focus:border-green"
          />
          <Command.List className="max-h-60 overflow-y-auto">
            <Command.Empty className="px-2.5 py-3 text-sm text-ink-subtle">
              No matching units.
            </Command.Empty>
            {units.map((unit) => {
              const isPicked = value.includes(unit.id);
              return (
                <Command.Item
                  key={unit.id}
                  value={`${unit.name} ${unit.abbreviation}`}
                  onSelect={() => toggle(unit.id)}
                  aria-checked={isPicked}
                  className="relative flex h-8.5 cursor-pointer items-center rounded-[5px] pr-2.5 pl-5.5 text-sm data-[selected=true]:bg-chip"
                >
                  {isPicked && (
                    <Check
                      size={13}
                      strokeWidth={2.4}
                      className="absolute left-1.5 text-green"
                    />
                  )}
                  <span>{unit.name}</span>
                  <span className="ml-auto pl-4 text-xs text-icon-muted">
                    {unit.abbreviation}
                  </span>
                </Command.Item>
              );
            })}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
