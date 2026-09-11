import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Loader2, ShoppingCart, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import {
  stopEvent,
  useAddToMenuButtonState,
} from "../hooks/useAddToMenuButtonState";
import type { RecipeCard as RecipeCardData } from "../types";

const IDLE_BG = "#3e5a33"; // --green
const EDITING_BG = "#fffcf6"; // --card
const EDITING_BORDER = "#e0d4bb"; // --border
const TRANSPARENT = "rgba(0,0,0,0)";

// Desktop width (164px = w-41) matches the compact AddToMenuButton's own fully-expanded pill width exactly.
const VARIANT = {
  desktop: { width: "w-41", radius: "rounded-full" },
  mobile: { width: "flex-1", radius: "rounded-lg" },
} as const;

export function AddToMenuCTA({
  recipe,
  variant,
}: {
  recipe: RecipeCardData;
  variant: "desktop" | "mobile";
}) {
  const {
    isEditing,
    isInMenu,
    menuServes,
    menuPending,
    servingAmount,
    canDecrease,
    canIncrease,
    isMutating,
    isRemoving,
    handleCartClick,
    handleCancel,
    handleConfirm,
    handleRemove,
    adjustAmount,
  } = useAddToMenuButtonState(recipe);

  const shape = VARIANT[variant];

  return (
    <div className={cn("relative h-8", shape.width)}>
      <motion.div
        animate={{
          backgroundColor: isEditing ? EDITING_BG : IDLE_BG,
          borderColor: isEditing ? EDITING_BORDER : TRANSPARENT,
        }}
        transition={{ duration: 0.25 }}
        className={cn("absolute inset-0 border", shape.radius)}
      >
        {/* Idle button fills the whole pill; icon/label inside are purely visual and animate independently. */}
        <div className={cn("absolute inset-0 overflow-hidden", shape.radius)}>
          <AnimatePresence>
            {!isEditing && (
              <motion.button
                key="idle"
                type="button"
                onClick={handleCartClick}
                disabled={menuPending}
                aria-label={
                  menuPending
                    ? "Loading menu status"
                    : isInMenu
                      ? "Edit menu item"
                      : "Add to menu"
                }
                className="absolute inset-0 flex cursor-pointer items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                <motion.span
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -60, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center"
                >
                  {menuPending ? (
                    <Loader2 className="size-4 animate-spin text-background" />
                  ) : (
                    <ShoppingCart
                      className={cn(
                        "size-4 text-background",
                        isInMenu && "fill-current",
                      )}
                      strokeWidth={2}
                    />
                  )}
                </motion.span>

                <motion.span
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 60, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[13px] font-bold whitespace-nowrap text-background"
                >
                  {isInMenu ? "In Menu" : "Add to Menu"}
                </motion.span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Editing content — a near-verbatim port of the compact AddToMenuButton's editing state (same 32px sizing, borderless hover-circle stepper, Remove's own 0.3s-delayed drop), just re-centered in a fixed box instead of one that grows into it. */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              key="editing"
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { delay: 0.12 } }}
              exit={{ y: -16, opacity: 0, transition: { duration: 0.15 } }}
              className="absolute inset-0 flex items-center justify-between"
            >
              <button
                type="button"
                onClick={handleCancel}
                aria-label="Cancel"
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent"
              >
                <X className="size-4" />
              </button>

              <div className="flex items-center">
                <div className="h-4 w-px bg-border" />

                <div className="relative flex items-center px-2">
                  <button
                    type="button"
                    onClick={(event) => adjustAmount(event, -1)}
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
                    onClick={(event) => adjustAmount(event, 1)}
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
                          transition: {
                            duration: 0.25,
                            delay: 0.3,
                            ease: "easeOut",
                          },
                        }}
                        exit={{ opacity: 0 }}
                        onClick={handleRemove}
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

                <div className="h-4 w-px bg-border" />
              </div>

              <motion.button
                type="button"
                initial={{ y: -16, opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  transition: { delay: 0.15, duration: 0.2 },
                }}
                exit={{ y: -16, opacity: 0, transition: { duration: 0.1 } }}
                onClick={handleConfirm}
                disabled={isMutating}
                aria-label="Confirm amount"
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-success transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="size-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Badge sits on the outer, non-clipped wrapper so its floating corner isn't cut off by the idle content's overflow-hidden. */}
      <AnimatePresence>
        {isInMenu && !isEditing && !menuPending && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute -top-2 -right-2 z-10 flex size-5 items-center justify-center overflow-visible rounded-full border-2 border-background bg-success text-xs font-medium text-success-foreground shadow-lg"
          >
            {menuServes ?? servingAmount}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
