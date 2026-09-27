import { useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ConfirmActionDialog({
  trigger,
  title,
  description,
  confirmLabel,
  pendingLabel,
  isPending = false,
  destructive = false,
  onConfirm,
}: {
  trigger: ReactElement;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  isPending?: boolean;
  destructive?: boolean;
  onConfirm: (close: () => void) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={() => onConfirm(close)}
            disabled={isPending}
          >
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
