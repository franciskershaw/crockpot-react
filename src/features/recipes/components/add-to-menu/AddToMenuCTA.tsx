import { cn } from "@/lib/utils";
import { Loader2, ShoppingCart, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { useAddToMenuButtonState } from "../../hooks/useAddToMenuButtonState";
import type { RecipeCard as RecipeCardData } from "../../types";
import { AddToMenuBadge } from "./AddToMenuBadge";
import { AddToMenuConfirmButton } from "./AddToMenuConfirmButton";
import { AddToMenuStepperControls } from "./AddToMenuStepperControls";

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

        {/* Editing content — reuses the compact AddToMenuButton's stepper/confirm, re-centered in a fixed box instead of one that grows into it. */}
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
                <AddToMenuStepperControls
                  servingAmount={servingAmount}
                  canDecrease={canDecrease}
                  canIncrease={canIncrease}
                  isMutating={isMutating}
                  isInMenu={isInMenu}
                  isRemoving={isRemoving}
                  onAdjust={adjustAmount}
                  onRemove={handleRemove}
                />
                <div className="h-4 w-px bg-border" />
              </div>

              <AddToMenuConfirmButton
                axis="y"
                isMutating={isMutating}
                onConfirm={handleConfirm}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AddToMenuBadge
        show={isInMenu && !isEditing && !menuPending}
        count={menuServes ?? servingAmount}
      />
    </div>
  );
}
