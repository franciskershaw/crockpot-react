import { useState, type Ref } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { RecipeCategory } from "@/features/recipes/data/types";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

const MAX_CATEGORIES = 3;

export function CategoryPicker({
  categories,
  selectedIds,
  onChange,
  triggerRef,
}: {
  categories: RecipeCategory[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  triggerRef?: Ref<HTMLButtonElement>;
}) {
  const [open, setOpen] = useState(false);
  const atCap = selectedIds.length >= MAX_CATEGORIES;
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  const toggle = (id: string) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selected) => selected !== id)
        : [...selectedIds, id],
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-[7px] border-[1.5px] border-border bg-card p-2">
          {selectedIds.map((id) => (
            <span
              key={id}
              className="flex h-8.5 items-center gap-1.5 rounded-full bg-green pr-2 pl-3.5 text-sm font-bold text-on-dark"
            >
              {nameById.get(id)}
              <button
                type="button"
                aria-label={`Remove ${nameById.get(id)}`}
                onClick={() => toggle(id)}
                className="flex size-5 cursor-pointer items-center justify-center rounded-full"
              >
                <X size={13} strokeWidth={2.6} />
              </button>
            </span>
          ))}
          <PopoverTrigger asChild>
            <button
              ref={triggerRef}
              type="button"
              className="flex h-8.5 cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-dashed border-faint-border px-3.5 text-sm font-semibold text-ink-body"
            >
              <Plus size={14} strokeWidth={2.2} />
              Add category
            </button>
          </PopoverTrigger>
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-(--radix-popover-trigger-width) min-w-60 rounded-lg border-border bg-card p-1.5 shadow-popover"
      >
        <ul className="max-h-80 overflow-y-auto">
          {categories.map((category) => {
            const checked = selectedIds.includes(category.id);
            const disabled = atCap && !checked;
            return (
              <li key={category.id}>
                <label
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-[5px] px-2.5 text-[15px] font-semibold text-ink-secondary",
                    disabled
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:bg-chip",
                  )}
                >
                  <Checkbox
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={() => toggle(category.id)}
                    aria-label={category.name}
                  />
                  {category.name}
                </label>
              </li>
            );
          })}
        </ul>
        <div className="mt-1 flex items-center justify-between gap-3 border-t border-card-shadow px-2.5 pt-2.5 pb-1.5">
          <p className="text-[13px] text-muted-foreground">
            {atCap ? "Up to 3 — remove one to add another" : "Pick up to 3"}
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="cursor-pointer text-sm font-bold text-green"
          >
            Done
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
