import { useEffect } from "react";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

const DESKTOP_BREAKPOINT_QUERY = "(min-width: 768px)";

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
  useEffect(() => {
    if (!open) return;

    const query = window.matchMedia(DESKTOP_BREAKPOINT_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) onOpenChange(false);
    };

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-foreground/55"
        className="inset-x-0 top-auto bottom-0 left-0 flex max-h-[calc(100dvh-16px)] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-t-[20px] rounded-b-none border-0 bg-background p-0 shadow-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"
      >
        <div className="mx-auto mt-1.5 h-1 w-9 shrink-0 rounded-full bg-[#DCCFB4]" />

        <div className="relative shrink-0 px-5 pt-3 pb-3">
          {header}
          <DialogClose
            aria-label="Close filters"
            className="absolute top-2 right-4 flex size-7 items-center justify-center rounded-full bg-chip text-ink-secondary"
          >
            <X strokeWidth={2.2} className="size-3" />
          </DialogClose>
        </div>

        <DialogTitle className="sr-only">Recipe Filters</DialogTitle>
        <DialogDescription className="sr-only">
          Search and filter the recipe catalog.
        </DialogDescription>

        <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
