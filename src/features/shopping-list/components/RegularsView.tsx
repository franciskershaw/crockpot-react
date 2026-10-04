import { useState } from "react";
import { StatePanel } from "@/components/StatePanel";
import { Checkbox } from "@/components/ui/checkbox";
import { RotateCw } from "lucide-react";

import type { Regular } from "../data/types";
import { useRegulars } from "../hooks/useRegulars";
import { groupRegulars } from "../utils/groupRegulars";

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
    <div className="min-h-0 overflow-y-auto px-4.5 pt-2 pb-3">
      {groupRegulars(regulars).map((group) => (
        <fieldset key={group.categoryId} className="min-w-0 pt-2.5">
          <legend className="w-full border-b border-card-shadow pb-1.5 text-[11px] font-bold tracking-[0.1em] text-icon-muted uppercase">
            {group.categoryName}
          </legend>
          {group.regulars.map((regular) => (
            <RegularsRow
              key={regular.id}
              regular={regular}
              ticked={!unticked.has(regular.id)}
              onToggle={(ticked) => toggle(regular.id, ticked)}
            />
          ))}
        </fieldset>
      ))}
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
    <label className="flex cursor-pointer items-center gap-2.25 py-1.75 text-[15px]">
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
