import { cn } from "@/lib/utils";
import { ShoppingCart, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";

import type { RecipeCard as RecipeCardData } from "../data/types";
import { useAddToMenuButtonState } from "../hooks/useAddToMenuButtonState";
import { recipeDetailPath } from "../utils/recipeDetailPath";
import { stopEvent } from "../utils/stopEvent";
import { ICON_BUTTON_CLASSES } from "../utils/styles";
import { AddToMenuBadge } from "./AddToMenuBadge";
import { AddToMenuConfirmButton } from "./AddToMenuConfirmButton";
import { AddToMenuStepperControls } from "./AddToMenuStepperControls";
import { RecipeFavouriteButton } from "./RecipeFavouriteButton";

const OVERLAY_FADE_S = 0.25;
// Bordered 32px circles with an invisible 4px ring, so each tap area is 40px without overlapping.
const ROW_ACTION_CLASSES =
  "relative after:absolute after:-inset-1 after:content-['']";

export function MobileRecipeRow({
  recipe,
  from,
  onRemoveFromMenu,
  onUnfavourite,
}: {
  recipe: RecipeCardData;
  from: string;
  onRemoveFromMenu?: () => void;
  onUnfavourite?: () => void;
}) {
  const {
    isEditing,
    isInMenu,
    editingInMenu,
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
  } = useAddToMenuButtonState(recipe, { onRemove: onRemoveFromMenu });

  return (
    <div className="relative">
      <Link
        to={recipeDetailPath(recipe.id, from)}
        className="flex min-h-18 items-center gap-3 rounded-lg border border-border bg-card p-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <div className="size-14 shrink-0 overflow-hidden rounded-md bg-muted">
          {recipe.imageUrl && (
            <img
              src={recipe.imageUrl}
              alt=""
              loading="lazy"
              className="block size-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className="truncate font-display text-base leading-tight text-foreground"
            title={recipe.name}
          >
            {recipe.name}
          </h3>
          <p className="mt-0.5 text-xs text-ink-subtle">
            {recipe.timeInMinutes} mins
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <RecipeFavouriteButton
            recipe={recipe}
            onClick={stopEvent}
            onUnfavourite={onUnfavourite}
            className={cn(ROW_ACTION_CLASSES, "border border-border bg-card")}
          />
          <button
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
            className={cn(
              ICON_BUTTON_CLASSES,
              ROW_ACTION_CLASSES,
              "border border-border bg-card disabled:cursor-not-allowed",
              menuPending
                ? "text-muted-foreground/50"
                : isInMenu
                  ? "text-success"
                  : "text-muted-foreground",
            )}
          >
            <ShoppingCart
              className={cn(
                "size-4 transition-all duration-200",
                isInMenu && "fill-current",
              )}
            />
            <AddToMenuBadge
              show={isInMenu && !menuPending}
              count={menuServes ?? servingAmount}
              exitDelay={OVERLAY_FADE_S}
            />
          </button>
        </div>
      </Link>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: OVERLAY_FADE_S }}
            className={cn(
              "absolute inset-0 z-20 flex justify-center rounded-lg bg-background/86 backdrop-blur-[3px]",
              editingInMenu ? "pt-1.5" : "items-center",
            )}
          >
            <motion.div
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.22, delay: 0.08 }}
              className="flex h-8 items-center rounded-full border border-border bg-card shadow-sm"
            >
              <button
                type="button"
                onClick={handleCancel}
                aria-label="Cancel"
                className="flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="size-4" />
              </button>
              <div className="h-4 w-px bg-border" />
              <AddToMenuStepperControls
                servingAmount={servingAmount}
                canDecrease={canDecrease}
                canIncrease={canIncrease}
                isMutating={isMutating}
                isInMenu={editingInMenu}
                isRemoving={isRemoving}
                onAdjust={adjustAmount}
                onRemove={handleRemove}
              />
              <div className="h-4 w-px bg-border" />
              <AddToMenuConfirmButton
                axis="y"
                isMutating={isMutating}
                onConfirm={handleConfirm}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
