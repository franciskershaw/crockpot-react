import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { stopEvent } from "../../hooks/useAddToMenuButtonState";

export function AddToMenuStepperControls({
  servingAmount,
  canDecrease,
  canIncrease,
  isMutating,
  isInMenu,
  isRemoving,
  onAdjust,
  onRemove,
}: {
  servingAmount: number;
  canDecrease: boolean;
  canIncrease: boolean;
  isMutating: boolean;
  isInMenu: boolean;
  isRemoving: boolean;
  onAdjust: (event: React.MouseEvent, delta: number) => void;
  onRemove: (event: React.MouseEvent) => void;
}) {
  return (
    <div className="relative flex items-center px-2">
      <button
        type="button"
        onClick={(event) => onAdjust(event, -1)}
        disabled={!canDecrease}
        aria-label="Decrease servings"
        className="flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="text-sm leading-none font-bold">−</span>
      </button>

      <div
        className="flex min-w-8 items-center justify-center px-2 text-center text-sm font-medium text-foreground"
        onClick={stopEvent}
      >
        {isMutating ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          servingAmount
        )}
      </div>

      <button
        type="button"
        onClick={(event) => onAdjust(event, 1)}
        disabled={!canIncrease}
        aria-label="Increase servings"
        className="flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="text-sm leading-none font-bold">+</span>
      </button>

      <AnimatePresence>
        {isInMenu && (
          <motion.button
            key="remove"
            type="button"
            initial={{ y: -20, opacity: 0, scale: 0.9 }}
            animate={{
              y: 20,
              opacity: 1,
              scale: 1,
              transition: { duration: 0.25, delay: 0.3, ease: "easeOut" },
            }}
            exit={{ opacity: 0 }}
            onClick={onRemove}
            disabled={isRemoving}
            className={cn(
              buttonVariants({ variant: "destructive" }),
              "absolute top-3 left-1/2 z-10 h-auto -translate-x-1/2 transform rounded-full px-3 py-1 text-xs shadow-lg",
            )}
          >
            Remove from menu
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
