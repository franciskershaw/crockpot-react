import type { ReactElement } from "react";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";

import { useClearMenu } from "../hooks/useClearMenu";

export function ClearMenuDialog(props: {
  trigger?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const clearMenu = useClearMenu();

  return (
    <ConfirmActionDialog
      {...props}
      title="Clear your menu?"
      description="This removes every recipe from your menu and rebuilds your shopping list. Items you've added by hand stay."
      confirmLabel="Clear menu"
      destructive
      onConfirm={(close) => {
        clearMenu.mutate();
        close();
      }}
    />
  );
}
