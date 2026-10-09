import { QuantityControl } from "@/components/QuantityControl";
import { StatePanel } from "@/components/StatePanel";
import type { Unit } from "@/features/catalog/data/types";
import { useItems } from "@/features/catalog/hooks/useItems";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { unitOptionsFor } from "@/features/catalog/utils/unitOptions";
import { byId } from "@/lib/byId";
import { RotateCw, Trash2 } from "lucide-react";

import type { Regular } from "../data/types";
import { useCreateRegular } from "../hooks/useCreateRegular";
import { useDeleteRegular } from "../hooks/useDeleteRegular";
import { useRegulars } from "../hooks/useRegulars";
import { useUpdateRegular } from "../hooks/useUpdateRegular";
import { createRegularErrorCopy } from "../utils/createRegularErrorCopy";
import { groupRegulars } from "../utils/groupRegulars";
import { AddItemRow } from "./AddItemRow";
import { RegularsCategoryCard } from "./RegularsCategoryCard";
import { RegularsPlaceholder } from "./RegularsPlaceholder";

export function RegularsEditView() {
  const { data: regulars, isError, refetch } = useRegulars();
  const create = useCreateRegular();
  const { data: items } = useItems();
  const { data: units } = useUnits();
  const itemsById = byId(items);
  const unitsById = byId(units);

  if (!regulars) {
    return <RegularsPlaceholder isError={isError} onRetry={() => refetch()} />;
  }

  const unitOptionsForRegular = (regular: Regular) => {
    const item = itemsById.get(regular.itemId);
    return item ? unitOptionsFor(item, unitsById) : (units ?? []);
  };

  return (
    <>
      <AddItemRow
        label="Add a regular"
        unavailable={{
          itemIds: new Set(regulars.map((regular) => regular.itemId)),
          tag: "Already a regular",
        }}
        error={createRegularErrorCopy(create.error)}
        isPending={create.isPending}
        isError={create.isError}
        onReset={create.reset}
        onConfirm={(item, quantity, unitId, close) =>
          create.mutate(
            { itemId: item.id, quantity, unitId },
            { onSuccess: close },
          )
        }
      />
      {regulars.length === 0 ? (
        <div className="min-h-0 overflow-y-auto">
          <StatePanel
            icon={RotateCw}
            heading="No regulars yet"
            description="Search above for the things you buy most weeks — milk, bin bags, eggs — and restocking before a shop takes one tap."
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto px-4.5 pt-3.5 pb-3">
          {groupRegulars(regulars).map((group) => (
            <RegularsCategoryCard
              key={group.categoryId}
              categoryName={group.categoryName}
            >
              {group.regulars.map((regular) => (
                <RegularsEditRow
                  key={regular.id}
                  regular={regular}
                  unitOptions={unitOptionsForRegular(regular)}
                />
              ))}
            </RegularsCategoryCard>
          ))}
        </div>
      )}
    </>
  );
}

function RegularsEditRow({
  regular,
  unitOptions,
}: {
  regular: Regular;
  unitOptions: Unit[];
}) {
  const update = useUpdateRegular();
  const remove = useDeleteRegular();

  return (
    <div className="flex min-h-11 items-center gap-2.5 border-b border-row-divider py-1.5 last:border-b-0">
      <span className="min-w-0 flex-1 truncate text-[15px]">
        {regular.itemName}
      </span>
      <QuantityControl
        itemName={regular.itemName}
        quantity={regular.quantity}
        unitAbbreviation={regular.unitAbbreviation}
        obtained={false}
        units={unitOptions}
        unitId={regular.unitId}
        onCommit={(quantity, unitId = null) =>
          update.mutate({ id: regular.id, quantity, unitId })
        }
      />
      <button
        type="button"
        aria-label={`Remove ${regular.itemName}`}
        disabled={remove.isPending}
        onClick={() => remove.mutate({ id: regular.id })}
        className="flex size-6.5 shrink-0 cursor-pointer items-center justify-center rounded-md text-rust-icon transition-colors hover:bg-chip disabled:cursor-default disabled:opacity-50"
      >
        <Trash2 size={14} strokeWidth={1.9} />
      </button>
    </div>
  );
}
