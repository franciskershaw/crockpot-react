import { lazy, Suspense, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/components/AuthContext";
import { isAdmin } from "@/features/auth/utils/isAdmin";
import { AddItemEditor } from "@/features/catalog/components/AddItemEditor";
import { AddItemSearch } from "@/features/catalog/components/AddItemSearch";
import type { Item } from "@/features/catalog/data/types";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { unitOptionsFor } from "@/features/catalog/utils/unitOptions";
import { cn } from "@/lib/utils";

// Admin-only, and the only user of zod/react-hook-form.
const CreateItemDialog = lazy(() =>
  import("@/features/catalog/components/CreateItemDialog").then((m) => ({
    default: m.CreateItemDialog,
  })),
);

export function AddItemRow({
  label,
  unavailable,
  error,
  isPending,
  isError,
  onReset,
  onConfirm,
}: {
  label?: string;
  unavailable?: { itemIds: ReadonlySet<string>; tag: string };
  error?: ReactNode;
  isPending: boolean;
  isError: boolean;
  onReset: () => void;
  onConfirm: (
    item: Item,
    quantity: number,
    unitId: string | null,
    close: () => void,
  ) => void;
}) {
  const { user } = useAuth();
  const { data: units } = useUnits();
  const [picked, setPicked] = useState<Item | null>(null);
  const [returnFocus, setReturnFocus] = useState(false);
  const [newItemName, setNewItemName] = useState<string | null>(null);
  const [resumeKey, setResumeKey] = useState(0);

  const allowedUnits = useMemo(
    () => (picked ? unitOptionsFor(picked, units ?? []) : []),
    [picked, units],
  );

  const close = () => {
    setPicked(null);
    setReturnFocus(true);
  };

  const pick = (item: Item) => {
    onReset();
    setPicked(item);
  };

  return (
    <div
      className={cn(
        "border-b border-card-shadow px-3 py-2.5 transition-colors",
        picked && "bg-search-secondary",
      )}
    >
      {picked ? (
        <>
          <AddItemEditor
            item={picked}
            allowedUnits={allowedUnits}
            isPending={isPending}
            isError={isError}
            onConfirm={(quantity, unitId) =>
              onConfirm(picked, quantity, unitId, close)
            }
            onCancel={close}
          />
          {error && (
            <p role="alert" className="mt-1 px-1 text-[13px] text-rust-text">
              {error}
            </p>
          )}
        </>
      ) : (
        <AddItemSearch
          label={label}
          unavailable={unavailable}
          focusOnMount={returnFocus}
          resumeKey={resumeKey}
          onCreate={isAdmin(user) ? setNewItemName : undefined}
          onPick={pick}
        />
      )}
      {isAdmin(user) && (
        <Suspense fallback={null}>
          <CreateItemDialog
            open={newItemName !== null}
            initialName={newItemName ?? ""}
            onCreated={(item) => {
              setNewItemName(null);
              pick(item);
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
