import { ConfirmActionDialog } from "@/components/overlays/ConfirmActionDialog";
import { RotateCw } from "lucide-react";

import { useRegenerateShoppingList } from "../hooks/useRegenerateShoppingList";

export function RegenerateShoppingListButton({
  disabled,
}: {
  disabled: boolean;
}) {
  const regenerate = useRegenerateShoppingList();

  return (
    <ConfirmActionDialog
      trigger={
        <button
          type="button"
          disabled={disabled}
          className="flex cursor-pointer items-center gap-1.75 rounded-full border border-on-dark/32 px-3.25 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors hover:bg-on-dark/10 disabled:cursor-not-allowed disabled:border-on-dark/16 disabled:text-on-dark/40 disabled:hover:bg-transparent"
        >
          <RotateCw size={14} strokeWidth={2.2} />
          Regenerate
        </button>
      }
      title="Regenerate shopping list?"
      description="This rebuilds the list from the recipes on your menu. You'll lose anything you've added yourself or ticked off."
      confirmLabel="Regenerate list"
      pendingLabel="Regenerating…"
      isPending={regenerate.isPending}
      onConfirm={(close) => regenerate.mutate(undefined, { onSuccess: close })}
    />
  );
}
