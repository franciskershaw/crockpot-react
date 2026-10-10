import { EmptyTabPanel } from "@/components/feedback/EmptyTabPanel";
import { LoadErrorPanel } from "@/components/feedback/LoadErrorPanel";
import { UndoTile } from "@/components/feedback/UndoTile";
import { PageTitle } from "@/components/meta/PageTitle";
import { RecipeListGrid } from "@/features/recipes/components/RecipeListGrid";
import { ShoppingListPanel } from "@/features/shopping-list/components/ShoppingListPanel";
import { ShoppingListSheet } from "@/features/shopping-list/components/ShoppingListSheet";
import { SCROLL_PANE_CLASSES } from "@/lib/styles";
import { buildUndoSlots, type UndoSlot } from "@/lib/undoSlots";
import { cn } from "@/lib/utils";
import { ChefHat } from "lucide-react";
import { motion } from "motion/react";

import { MenuFooterPill } from "../components/MenuFooterPill";
import { MenuSkeleton } from "../components/MenuSkeleton";
import type { MenuEntry } from "../data/types";
import { useMenu } from "../hooks/useMenu";
import { useUndoableMenuRemoval } from "../hooks/useUndoableMenuRemoval";

export function MenuPage() {
  const { data: menu, isError, refetch } = useMenu();
  const entries = menu?.entries;
  const { removals, remove, canUndo, undo, isPaused, pause, resume } =
    useUndoableMenuRemoval();
  const slots = buildUndoSlots(
    entries ?? [],
    (entry) => entry.recipeId,
    removals,
  );
  const showUndo = slots.some((slot) => slot.undo);

  const renderUndo = (slot: UndoSlot<MenuEntry>) => (
    <UndoTile
      title={slot.item.recipe.name}
      canUndo={canUndo(slot.key)}
      onUndo={() => undo(slot.key, slot.index)}
      paused={isPaused(slot.key)}
      onPause={() => pause(slot.key)}
      onResume={() => resume(slot.key)}
    />
  );

  return (
    <div className="grid grid-cols-1 items-start gap-6.5 lg:h-full lg:grid-cols-[1fr_372px] lg:grid-rows-1 lg:items-stretch">
      <PageTitle>Menu</PageTitle>
      <div className="relative min-w-0 lg:h-full">
        <motion.div
          layoutScroll
          className={cn(SCROLL_PANE_CLASSES, "lg:pb-28")}
        >
          {!entries ? (
            isError ? (
              <LoadErrorPanel what="your menu" onRetry={() => refetch()} />
            ) : (
              <MenuSkeleton />
            )
          ) : entries.length === 0 && !showUndo ? (
            <EmptyTabPanel
              icon={ChefHat}
              heading="Nothing on the menu yet"
              description="Tap the basket on a recipe to add it to your menu. Your shopping list is built from whatever you add."
            />
          ) : (
            <div className="pb-16 lg:pb-0">
              <RecipeListGrid
                slots={slots}
                renderUndo={renderUndo}
                testId="menu"
                itemProps={(slot) => ({
                  recipe: slot.item.recipe,
                  from: "/menu",
                  onRemoveFromMenu: () =>
                    remove(slot.item, slot.anchorKey, slot.index),
                })}
              />
            </div>
          )}
        </motion.div>
        {entries && <MenuFooterPill recipeCount={entries.length} />}
      </div>
      <div className="hidden min-w-0 lg:block lg:-mx-1 lg:h-full lg:px-1 lg:pt-1 lg:pb-6">
        <ShoppingListPanel />
      </div>
      <ShoppingListSheet />
    </div>
  );
}
