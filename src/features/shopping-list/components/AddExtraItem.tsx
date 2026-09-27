import { useMemo, useRef, useState } from "react";
import { useAuth } from "@/features/auth/components/AuthContext";
import type { Item } from "@/features/catalog/data/types";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { cn } from "@/lib/utils";

import { useAddShoppingListItem } from "../hooks/useAddShoppingListItem";
import { AddItemEditor } from "./AddItemEditor";
import { AddItemSearch } from "./AddItemSearch";
import { CreateItemDialog } from "./CreateItemDialog";

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
  const [newItemName, setNewItemName] = useState<string | null>(null);
  const [resumeKey, setResumeKey] = useState(0);
  const isAdmin = user?.role === "ADMIN";
  const addCount = useRef(0);

  const allowedUnits = useMemo(() => {
    if (!picked) return [];
    if (picked.allowedUnitIds.length === 0) return units ?? [];
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
        "border-b border-card-shadow px-3 py-2.5 transition-colors",
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
          resumeKey={resumeKey}
          onCreate={isAdmin ? setNewItemName : undefined}
          onPick={(item) => {
            add.reset();
            setPicked(item);
          }}
        />
      )}
      {isAdmin && (
        <CreateItemDialog
          open={newItemName !== null}
          initialName={newItemName ?? ""}
          onCreated={(item) => {
            setNewItemName(null);
            add.reset();
            setPicked(item);
          }}
          onCancel={() => {
            setNewItemName(null);
            setResumeKey((key) => key + 1);
          }}
        />
      )}
    </div>
  );
}
