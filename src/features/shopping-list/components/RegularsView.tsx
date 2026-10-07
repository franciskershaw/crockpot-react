import { useId, useState } from "react";
import { StatePanel } from "@/components/StatePanel";
import { Checkbox } from "@/components/ui/checkbox";
import { CategoryIcon } from "@/features/catalog/components/CategoryIcon";
import { RotateCw } from "lucide-react";

import type { Regular } from "../data/types";
import { useRegulars } from "../hooks/useRegulars";
import {
  groupRegulars,
  type RegularsCategoryGroup,
} from "../utils/groupRegulars";

export function RegularsView() {
  const { data: regulars } = useRegulars();
  const [unticked, setUnticked] = useState<ReadonlySet<string>>(new Set());

  if (!regulars) return null;

  if (regulars.length === 0) {
    return (
      <StatePanel
        icon={RotateCw}
        heading="No regulars yet"
        description="Add the things you buy most weeks — milk, bin bags, eggs — so restocking before a shop takes one tap."
      />
    );
  }

  const toggle = (id: string, ticked: boolean) =>
    setUnticked((current) => {
      const next = new Set(current);
      if (ticked) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex min-h-0 flex-col gap-3 overflow-y-auto px-4.5 pt-3.5 pb-3">
      {groupRegulars(regulars).map((group) => (
        <RegularsCategory
          key={group.categoryId}
          group={group}
          isTicked={(id) => !unticked.has(id)}
          onToggle={toggle}
        />
      ))}
    </div>
  );
}

function RegularsCategory({
  group,
  isTicked,
  onToggle,
}: {
  group: RegularsCategoryGroup;
  isTicked: (id: string) => boolean;
  onToggle: (id: string, ticked: boolean) => void;
}) {
  const headingId = useId();

  return (
    <div
      role="group"
      aria-labelledby={headingId}
      className="rounded-[10px] border border-border bg-search-secondary"
    >
      <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-1.5">
        <span className="flex size-6.5 shrink-0 items-center justify-center rounded-md border border-border bg-card text-ink-subtle">
          <CategoryIcon
            categoryName={group.categoryName}
            size={14}
            strokeWidth={1.9}
          />
        </span>
        <h3
          id={headingId}
          className="font-display text-[17px] font-medium text-ink-secondary"
        >
          {group.categoryName}
        </h3>
      </div>
      <div className="px-3.5 pb-1.5">
        {group.regulars.map((regular) => (
          <RegularsRow
            key={regular.id}
            regular={regular}
            ticked={isTicked(regular.id)}
            onToggle={(ticked) => onToggle(regular.id, ticked)}
          />
        ))}
      </div>
    </div>
  );
}

function RegularsRow({
  regular,
  ticked,
  onToggle,
}: {
  regular: Regular;
  ticked: boolean;
  onToggle: (ticked: boolean) => void;
}) {
  const amount = regular.unitAbbreviation
    ? `${regular.quantity} ${regular.unitAbbreviation}`
    : String(regular.quantity);

  return (
    <label className="flex cursor-pointer items-center gap-2.25 border-b border-row-divider py-1.75 text-[15px] last:border-b-0">
      <Checkbox
        checked={ticked}
        onCheckedChange={(checked) => onToggle(checked === true)}
        aria-label={`Add ${regular.itemName}`}
        className="size-4.75 rounded-sm shadow-none [&_svg]:size-3"
      />
      <span>{regular.itemName}</span>
      <span aria-hidden className="text-separator-muted">
        ×
      </span>
      <span className="text-ink-subtle">{amount}</span>
    </label>
  );
}
