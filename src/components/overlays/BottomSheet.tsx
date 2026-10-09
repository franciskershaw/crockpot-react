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

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  header,
  closeLabel,
  closeAtWidth = 768,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  header?: ReactNode;
  closeLabel?: string;
  closeAtWidth?: number;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const query = window.matchMedia(`(min-width: ${closeAtWidth}px)`);
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) onOpenChange(false);
    };

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, [open, onOpenChange, closeAtWidth]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        animation="none"
        overlayClassName="bg-foreground/55 duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=closed]:duration-400"
        className="inset-x-0 top-auto bottom-0 left-0 flex max-h-[calc(100dvh-16px)] w-full max-w-none translate-x-0 sm:max-w-none translate-y-0 flex-col gap-0 overflow-hidden rounded-t-[20px] rounded-b-none border-0 bg-background p-0 shadow-none duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=closed]:animate-out data-[state=closed]:duration-400 data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom"
      >
        {header && (
          <div className="relative shrink-0 px-5 pt-5 pb-3">
            {header}
            <DialogClose
              aria-label={closeLabel}
              className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-full bg-chip text-ink-secondary"
            >
              <X strokeWidth={2.2} className="size-3" />
            </DialogClose>
          </div>
        )}

        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>

        {children}
      </DialogContent>
    </Dialog>
  );
}
