import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { RotateCw } from "lucide-react";

import type { AddedRow, Regular } from "../data/types";
import { useRegulars } from "../hooks/useRegulars";
import { useRestockRegulars } from "../hooks/useRestockRegulars";
import { useShoppingList } from "../hooks/useShoppingList";
import {
  groupRegulars,
  type RegularsCategoryGroup,
} from "../utils/groupRegulars";
import { regularsOnList } from "../utils/regularsOnList";
import { RegularsCategoryCard } from "./RegularsCategoryCard";
import { RegularsPlaceholder } from "./RegularsPlaceholder";

export function RegularsView({
  onRestocked,
}: {
  onRestocked: (added: AddedRow[]) => void;
}) {
  const { data: regulars, isError, refetch } = useRegulars();
  const { data: shoppingList } = useShoppingList();
  const restock = useRestockRegulars();
  const [unticked, setUnticked] = useState<ReadonlySet<string>>(new Set());

  if (!regulars) {
    return <RegularsPlaceholder isError={isError} onRetry={() => refetch()} />;
  }

  const onList = regularsOnList(regulars, shoppingList?.items ?? []);
  const isTicked = (id: string) => !onList.has(id) && !unticked.has(id);
  const tickedIds = regulars.map((regular) => regular.id).filter(isTicked);
  const toggle = (id: string, ticked: boolean) =>
    setUnticked((current) => {
      const next = new Set(current);
      if (ticked) next.delete(id);
      else next.add(id);
      return next;
    });
  const addToList = (ids: string[]) => {
    const added = regulars
      .filter((regular) => ids.includes(regular.id) && !onList.has(regular.id))
      .map(({ itemId, unitId }) => ({ itemId, unitId }));
    restock.mutate(ids, { onSuccess: () => onRestocked(added) });
  };

  return (
    <>
      <div className="shrink-0 px-4.5 pt-4">
        <button
          type="button"
          disabled={restock.isPending}
          onClick={() => addToList(regulars.map((regular) => regular.id))}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[9px] bg-green text-[15px] font-bold text-on-dark transition-colors hover:bg-green/90 disabled:cursor-default"
        >
          <RotateCw size={16} strokeWidth={2.2} />
          Add all to list
        </button>
        <div className="mt-3.5 flex items-center gap-3 text-[13px] text-ink-subtle">
          <span aria-hidden className="h-px flex-1 bg-card-shadow" />
          Or pick what you need
          <span aria-hidden className="h-px flex-1 bg-card-shadow" />
        </div>
      </div>
      <div className="flex min-h-0 flex-col gap-3 overflow-y-auto px-4.5 pt-3 pb-3">
        {groupRegulars(regulars).map((group) => (
          <RegularsCategory
            key={group.categoryId}
            group={group}
            isOnList={(id) => onList.has(id)}
            isTicked={isTicked}
            onToggle={toggle}
          />
        ))}
      </div>
      <footer className="shrink-0 border-t border-card-shadow px-4.5 py-3.5">
        {restock.isError && (
          <p role="alert" className="mb-2.5 text-center text-sm text-rust-text">
            Couldn't add your regulars. Try again.
          </p>
        )}
        <button
          type="button"
          disabled={tickedIds.length === 0 || restock.isPending}
          onClick={() => addToList(tickedIds)}
          className="h-12 w-full cursor-pointer rounded-[9px] border-[1.5px] border-green text-[15px] font-bold text-green transition-colors hover:bg-ingredient-chip-bg disabled:cursor-default disabled:border-border disabled:text-separator-muted disabled:hover:bg-transparent"
        >
          Add {tickedIds.length} to list
        </button>
      </footer>
    </>
  );
}

function RegularsCategory({
  group,
  isOnList,
  isTicked,
  onToggle,
}: {
  group: RegularsCategoryGroup;
  isOnList: (id: string) => boolean;
  isTicked: (id: string) => boolean;
  onToggle: (id: string, ticked: boolean) => void;
}) {
  return (
    <RegularsCategoryCard categoryName={group.categoryName}>
      {group.regulars.map((regular) => (
        <RegularsRow
          key={regular.id}
          regular={regular}
          onList={isOnList(regular.id)}
          ticked={isTicked(regular.id)}
          onToggle={(ticked) => onToggle(regular.id, ticked)}
        />
      ))}
    </RegularsCategoryCard>
  );
}

function RegularsRow({
  regular,
  onList,
  ticked,
  onToggle,
}: {
  regular: Regular;
  onList: boolean;
  ticked: boolean;
  onToggle: (ticked: boolean) => void;
}) {
  const amount = regular.unitAbbreviation
    ? `${regular.quantity} ${regular.unitAbbreviation}`
    : String(regular.quantity);

  return (
    <label
      className={cn(
        "flex items-center gap-2.25 border-b border-row-divider py-1.75 text-[15px] last:border-b-0",
        onList ? "text-ink-done" : "cursor-pointer",
      )}
    >
      <Checkbox
        checked={ticked}
        disabled={onList}
        onCheckedChange={(checked) => onToggle(checked === true)}
        aria-label={`Add ${regular.itemName}`}
      />
      <span className="truncate">{regular.itemName}</span>
      <span aria-hidden className="text-separator-muted">
        ×
      </span>
      <span className={cn("shrink-0", !onList && "text-ink-subtle")}>
        {amount}
      </span>
      {onList && (
        <span className="ml-auto shrink-0 rounded-full bg-chip px-2 py-0.5 text-[12px] font-bold text-ink-subtle">
          On your list
        </span>
      )}
    </label>
  );
}
