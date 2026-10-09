import type { ReactNode } from "react";
import { BottomSheet } from "@/components/overlays/BottomSheet";

export function MobileFilterDrawer({
  open,
  onOpenChange,
  header,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Recipe Filters"
      description="Search and filter the recipe catalog."
      header={header}
      closeLabel="Close filters"
    >
      <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
    </BottomSheet>
  );
}
