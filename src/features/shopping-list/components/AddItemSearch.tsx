import { useEffect, useMemo, useRef, useState } from "react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import type { Item } from "@/features/catalog/data/types";
import { useItemCategories } from "@/features/catalog/hooks/useItemCategories";
import { useItems } from "@/features/catalog/hooks/useItems";
import { FIELD_CLASSES } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { Command } from "cmdk";
import { Plus, X } from "lucide-react";

import { searchItems, type ItemMatch } from "../utils/searchItems";

const CREATE_ITEM_VALUE = "__create_item__";

function HighlightedName({ match }: { match: ItemMatch }) {
  const { name } = match.item;
  return (
    <span className="min-w-0 flex-1 truncate">
      {name.slice(0, match.matchStart)}
      <strong className="font-bold">
        {name.slice(match.matchStart, match.matchEnd)}
      </strong>
      {name.slice(match.matchEnd)}
    </span>
  );
}

export function AddItemSearch({
  onPick,
  onCreate,
  focusOnMount = false,
  resumeKey = 0,
}: {
  onPick: (item: Item) => void;
  onCreate?: (name: string) => void;
  focusOnMount?: boolean;
  resumeKey?: number;
}) {
  const { data: items } = useItems();
  const { data: categories } = useItemCategories();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [resumedKey, setResumedKey] = useState(resumeKey);

  if (resumeKey !== resumedKey) {
    setResumedKey(resumeKey);
    if (query.trim() !== "") setIsOpen(true);
  }
  const inputRef = useRef<HTMLInputElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusOnMount) inputRef.current?.focus();
  }, [focusOnMount]);

  const results = useMemo(
    () => searchItems(items ?? [], query),
    [items, query],
  );
  const categoryNames = useMemo(
    () => new Map(categories?.map((category) => [category.id, category.name])),
    [categories],
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.trim() !== "");
  };

  const reset = () => {
    setQuery("");
    setIsOpen(false);
  };

  const pick = (item: Item) => {
    onPick(item);
    reset();
  };

  const trimmedQuery = query.trim();
  const canCreate =
    onCreate !== undefined &&
    trimmedQuery !== "" &&
    !(items ?? []).some(
      (item) => item.name.toLowerCase() === trimmedQuery.toLowerCase(),
    );

  const create = () => {
    onCreate?.(trimmedQuery);
    setIsOpen(false);
  };

  return (
    <div>
      <Command shouldFilter={false} loop label="Add something extra">
        <Popover
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) setIsOpen(false);
          }}
        >
          <PopoverAnchor asChild>
            <div
              ref={anchorRef}
              className={cn(FIELD_CLASSES, "flex h-10 items-center gap-2 px-3")}
            >
              <Plus
                size={17}
                strokeWidth={2}
                className="shrink-0 text-icon-muted"
              />
              <Command.Input
                ref={inputRef}
                value={query}
                onValueChange={handleQueryChange}
                onKeyDown={(event) => {
                  if (event.key !== "Escape") return;
                  event.preventDefault();
                  if (isOpen) setIsOpen(false);
                  else setQuery("");
                }}
                aria-label="Add something extra"
                placeholder="Add something extra"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-icon-muted"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    reset();
                    inputRef.current?.focus();
                  }}
                  className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-subtle hover:bg-chip"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              )}
            </div>
          </PopoverAnchor>
          <PopoverContent
            align="start"
            sideOffset={6}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            onInteractOutside={(event) => {
              if (anchorRef.current?.contains(event.target as Node)) {
                event.preventDefault();
              }
            }}
            className="w-(--radix-popover-trigger-width) rounded-lg border-border bg-card p-1 shadow-popover"
          >
            <Command.List>
              {results.length === 0 ? (
                <p className="px-2.5 py-3.5 text-sm text-ink-subtle">
                  Nothing called “{trimmedQuery}” yet.
                </p>
              ) : (
                <Command.Group className="max-h-[304px] overflow-y-auto">
                  {results.map((match) => (
                    <Command.Item
                      key={match.item.id}
                      value={match.item.id}
                      onSelect={() => pick(match.item)}
                      className="group flex h-9.5 cursor-pointer items-center gap-3 rounded-[5px] px-2.5 text-[15px] data-[selected=true]:bg-chip"
                    >
                      <HighlightedName match={match} />
                      <span className="shrink-0 text-xs text-icon-muted group-data-[selected=true]:text-ink-subtle">
                        {categoryNames.get(match.item.categoryId)}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
              {canCreate && (
                <>
                  <Command.Separator className="my-1 h-px bg-card-shadow" />
                  <Command.Group>
                    <Command.Item
                      value={CREATE_ITEM_VALUE}
                      onSelect={create}
                      className="flex h-9.5 cursor-pointer items-center gap-2.5 rounded-[5px] px-2.5 text-[15px] font-bold text-green data-[selected=true]:bg-chip"
                    >
                      <Plus size={16} strokeWidth={2.2} className="shrink-0" />
                      Add “{trimmedQuery}” as a new item
                    </Command.Item>
                  </Command.Group>
                </>
              )}
            </Command.List>
          </PopoverContent>
        </Popover>
      </Command>
    </div>
  );
}
