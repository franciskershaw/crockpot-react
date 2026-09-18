import { ShoppingCart, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { useAddToMenuButtonState } from "../../hooks/useAddToMenuButtonState";
import type { RecipeCard as RecipeCardData } from "../../types";
import { AddToMenuBadge } from "./AddToMenuBadge";
import { AddToMenuConfirmButton } from "./AddToMenuConfirmButton";
import { AddToMenuStepperControls } from "./AddToMenuStepperControls";

export function AddToMenuButton({ recipe }: { recipe: RecipeCardData }) {
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

  return (
    <div className="relative">
      <div className="flex h-8 items-center rounded-full border border-gray-200 bg-white/95 shadow-sm">
        <div className="relative flex h-8 w-8 items-center justify-center">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.button
                key="cancel"
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={handleCancel}
                aria-label="Cancel"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </motion.button>
            ) : (
              <motion.button
                key="cart"
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={handleCartClick}
                disabled={menuPending}
                aria-label={
                  menuPending
                    ? "Loading menu status"
                    : isInMenu
                      ? "Edit menu item"
                      : "Add to menu"
                }
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed ${
                  menuPending
                    ? "text-gray-300"
                    : isInMenu
                      ? "cursor-pointer text-success hover:bg-accent"
                      : "cursor-pointer text-gray-600 hover:bg-accent"
                }`}
              >
                <ShoppingCart
                  className={`h-4 w-4 transition-all duration-200 ${isInMenu ? "fill-current" : ""}`}
                />
              </motion.button>
            )}
          </AnimatePresence>

          <AddToMenuBadge
            show={isInMenu && !isEditing && !menuPending}
            count={menuServes ?? servingAmount}
          />
        </div>

        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{
                width: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2, delay: 0.1 },
              }}
              className="relative flex items-center overflow-visible"
            >
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ duration: 0.15, delay: 0.1 }}
                className="h-4 w-px bg-gray-300"
              />

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
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
              </motion.div>

              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ duration: 0.15, delay: 0.1 }}
                className="h-4 w-px bg-gray-300"
              />

              <AddToMenuConfirmButton
                axis="x"
                isMutating={isMutating}
                onConfirm={handleConfirm}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
