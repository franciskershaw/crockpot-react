import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

import type { ShoppingListItem } from "../data/types";
import { useDeleteShoppingListItem } from "../hooks/useDeleteShoppingListItem";
import { useUpdateShoppingListItem } from "../hooks/useUpdateShoppingListItem";
import { QuantityControl } from "./QuantityControl";

export function ShoppingListRow({ item }: { item: ShoppingListItem }) {
  const update = useUpdateShoppingListItem();
  const remove = useDeleteShoppingListItem();

  return (
    <div className="flex items-center gap-2.25 border-b border-row-divider py-1.5 last:border-b-0">
      <Checkbox
        checked={item.obtained}
        onCheckedChange={(checked) =>
          update.mutate({ id: item.id, obtained: checked === true })
        }
        aria-label={`Mark ${item.itemName} as bought`}
        className="size-4.75 rounded-sm shadow-none [&_svg]:size-3"
      />
      <div className="flex min-w-0 flex-1 items-center gap-1.75 text-[15px]">
        <span
          className={cn(
            "truncate",
            item.obtained && "text-ink-done line-through",
          )}
        >
          {item.itemName}
        </span>
        <span aria-hidden className="text-separator-muted">
          ×
        </span>
        <QuantityControl
          itemName={item.itemName}
          quantity={item.quantity}
          unitAbbreviation={item.unitAbbreviation}
          obtained={item.obtained}
          onCommit={(quantity) => update.mutate({ id: item.id, quantity })}
        />
      </div>
      <button
        type="button"
        aria-label={`Remove ${item.itemName}`}
        onClick={() => remove.mutate({ id: item.id })}
        className="flex size-6.5 shrink-0 cursor-pointer items-center justify-center rounded-md text-rust-icon transition-colors hover:bg-chip"
      >
        <Trash2 size={14} strokeWidth={1.9} />
      </button>
    </div>
  );
}
