import { lazy, Suspense, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/components/AuthContext";
import { AddItemEditor } from "@/features/catalog/components/AddItemEditor";
import { AddItemSearch } from "@/features/catalog/components/AddItemSearch";
import type { Item } from "@/features/catalog/data/types";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { unitOptionsFor } from "@/features/catalog/utils/unitOptions";
import { cn } from "@/lib/utils";

import type { AddedRow } from "../data/types";
import { useAddShoppingListItem } from "../hooks/useAddShoppingListItem";

// Admin-only, and the only user of zod/react-hook-form.
const CreateItemDialog = lazy(() =>
  import("@/features/catalog/components/CreateItemDialog").then((m) => ({
    default: m.CreateItemDialog,
  })),
);

export function AddExtraItem({
  onAdded,
}: {
  onAdded: (added: AddedRow) => void;
}) {
  const { user } = useAuth();
  const { data: units } = useUnits();
  const add = useAddShoppingListItem();
  const [picked, setPicked] = useState<Item | null>(null);
  const [returnFocus, setReturnFocus] = useState(false);
  const [newItemName, setNewItemName] = useState<string | null>(null);
  const [resumeKey, setResumeKey] = useState(0);
  const isAdmin = user?.role === "ADMIN";

  const allowedUnits = useMemo(
    () => (picked ? unitOptionsFor(picked, units ?? []) : []),
    [picked, units],
  );

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
                  onAdded({ itemId: picked.id, unitId });
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
        <Suspense fallback={null}>
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
        </Suspense>
      )}
    </div>
  );
}
