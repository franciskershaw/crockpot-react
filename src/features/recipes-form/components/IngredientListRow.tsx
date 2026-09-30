import { QuantityControl } from "@/components/QuantityControl";
import { CategoryIcon } from "@/features/catalog/components/CategoryIcon";
import type { Unit } from "@/features/catalog/data/types";
import { Trash2 } from "lucide-react";

import type { IngredientRow } from "../data/types";

export function IngredientListRow({
  row,
  unitAbbreviation,
  unitOptions,
  onChange,
  onRemove,
}: {
  row: IngredientRow;
  unitAbbreviation: string | null;
  unitOptions: Unit[];
  onChange: (row: IngredientRow) => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex min-h-13 items-center gap-3 border-b border-row-divider py-2 last:border-b-0">
      <QuantityControl
        itemName={row.itemName}
        quantity={Number(row.quantity)}
        unitAbbreviation={unitAbbreviation}
        obtained={false}
        units={unitOptions}
        unitId={row.unitId}
        onCommit={(quantity, unitId = null) =>
          onChange({ ...row, quantity: String(quantity), unitId })
        }
      />
      <span className="min-w-0 flex-1 truncate text-[15px]">
        {row.itemName}
      </span>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-chip text-ink-body">
        <CategoryIcon
          categoryName={row.itemCategoryName}
          size={15}
          strokeWidth={2}
          aria-hidden
        />
      </span>
      <button
        type="button"
        aria-label={`Remove ${row.itemName}`}
        onClick={onRemove}
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-icon-muted hover:text-ink-body"
      >
        <Trash2 size={16} strokeWidth={2} />
      </button>
    </li>
  );
}
