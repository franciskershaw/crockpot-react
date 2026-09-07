import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Loader2, ShoppingCart, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import {
  stopEvent,
  useAddToMenuButtonState,
} from "../hooks/useAddToMenuButtonState";
import type { RecipeCard as RecipeCardData } from "../types";

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
                      ? "cursor-pointer text-green-600 hover:bg-accent"
                      : "cursor-pointer text-gray-600 hover:bg-accent"
                }`}
              >
                <ShoppingCart
                  className={`h-4 w-4 transition-all duration-200 ${isInMenu ? "fill-current" : ""}`}
                />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isInMenu && !isEditing && !menuPending && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center overflow-visible rounded-full border-2 border-white bg-green-600 text-xs font-medium text-white shadow-lg"
              >
                {menuServes ?? servingAmount}
              </motion.div>
            )}
          </AnimatePresence>
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
                className="relative flex items-center px-2"
              >
                <button
                  type="button"
                  onClick={(event) => adjustAmount(event, -1)}
                  disabled={!canDecrease}
                  aria-label="Decrease servings"
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="text-sm leading-none font-bold">−</span>
                </button>

                <div
                  className="flex min-w-8 items-center justify-center px-2 text-center text-sm font-medium text-gray-800"
                  onClick={stopEvent}
                >
                  {isMutating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    servingAmount
                  )}
                </div>

                <button
                  type="button"
                  onClick={(event) => adjustAmount(event, 1)}
                  disabled={!canIncrease}
                  aria-label="Increase servings"
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
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
              </motion.div>

              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ duration: 0.15, delay: 0.1 }}
                className="h-4 w-px bg-gray-300"
              />

              <motion.button
                key="confirm"
                type="button"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{
                  x: 30,
                  opacity: 0,
                  transition: { duration: 0.1, delay: 0 },
                }}
                transition={{ duration: 0.2, delay: 0.15 }}
                onClick={handleConfirm}
                disabled={isMutating}
                aria-label="Confirm amount"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-green-600 transition-colors hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
