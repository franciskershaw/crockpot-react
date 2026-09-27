import { useMemo, useRef, useState } from "react";
import { useAuth } from "@/features/auth/components/AuthContext";
import type { Item } from "@/features/catalog/data/types";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { cn } from "@/lib/utils";

import { useAddShoppingListItem } from "../hooks/useAddShoppingListItem";
import { AddItemEditor } from "./AddItemEditor";
import { AddItemSearch } from "./AddItemSearch";

export interface RecentlyAdded {
  itemId: string;
  unitId: string | null;
  key: number;
}

export function AddExtraItem({
  onAdded,
}: {
  onAdded: (added: RecentlyAdded) => void;
}) {
  const { user } = useAuth();
  const { data: units } = useUnits();
  const add = useAddShoppingListItem();
  const [picked, setPicked] = useState<Item | null>(null);
  const [returnFocus, setReturnFocus] = useState(false);
  const [, setNewItemName] = useState<string | null>(null);
  const isAdmin = user?.role === "ADMIN";
  const addCount = useRef(0);

  const allowedUnits = useMemo(() => {
    if (!picked) return [];
    const unitsById = new Map(units?.map((unit) => [unit.id, unit]));
    return picked.allowedUnitIds.flatMap((id) => {
      const unit = unitsById.get(id);
      return unit ? [unit] : [];
    });
  }, [picked, units]);

  const close = () => {
    setPicked(null);
    setReturnFocus(true);
  };

  return (
    <div
      className={cn(
        "border-b border-card-shadow px-4 py-3.5 transition-colors",
        picked && "bg-search-secondary",
      )}
    >
      {picked ? (
        <AddItemEditor
          item={picked}
          allowedUnits={allowedUnits}
          isPending={add.isPending}
          isError={add.isError}
          onConfirm={(quantity, unitId) =>
            add.mutate(
              { itemId: picked.id, quantity, unitId },
              {
                onSuccess: () => {
                  addCount.current += 1;
                  onAdded({
                    itemId: picked.id,
                    unitId,
                    key: addCount.current,
                  });
                  close();
                },
              },
            )
          }
          onCancel={close}
        />
      ) : (
        <AddItemSearch
          focusOnMount={returnFocus}
          onCreate={isAdmin ? setNewItemName : undefined}
          onPick={(item) => {
            add.reset();
            setPicked(item);
          }}
        />
      )}
    </div>
  );
}
