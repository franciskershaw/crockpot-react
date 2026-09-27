import { MobileRecipeRow } from "@/features/recipes/components/MobileRecipeRow";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { ShoppingListPanel } from "@/features/shopping-list/components/ShoppingListPanel";
import { ShoppingListSheet } from "@/features/shopping-list/components/ShoppingListSheet";
import { motion } from "motion/react";

import {
  AnimatedMenuSlots,
  type MenuSlot,
} from "../components/AnimatedMenuSlots";
import { EmptyMenuPanel } from "../components/EmptyMenuPanel";
import { MenuFooterPill } from "../components/MenuFooterPill";
import { MenuUndoTile } from "../components/MenuUndoTile";
import { useMenu } from "../hooks/useMenu";
import { useUndoableMenuRemoval } from "../hooks/useUndoableMenuRemoval";

export function MenuPage() {
  const { data: menu } = useMenu();
  const entries = menu?.entries;
  const { removed, canUndo, remove, undo } = useUndoableMenuRemoval();
  const showUndo =
    removed !== null &&
    !entries?.some((entry) => entry.recipeId === removed.entry.recipeId);

  const slots: MenuSlot[] =
    entries?.map((entry, index) => ({ key: entry.recipeId, entry, index })) ??
    [];
  if (removed && showUndo) {
    slots.splice(removed.index, 0, {
      key: removed.entry.recipeId,
      entry: null,
      index: removed.index,
    });
  }

  const undoTile = removed && (
    <MenuUndoTile
      title={removed.entry.recipe.name}
      canUndo={canUndo}
      onUndo={undo}
    />
  );

  return (
    <div className="grid grid-cols-1 items-start gap-6.5 lg:h-full lg:grid-cols-[1fr_372px] lg:grid-rows-1 lg:items-stretch">
      <div className="relative min-w-0 lg:h-full">
        <motion.div
          layoutScroll
          className="lg:-mx-1 lg:h-full lg:overflow-y-auto lg:px-1 lg:pt-1 lg:pb-28"
        >
          {entries &&
            (entries.length === 0 && !showUndo ? (
              <EmptyMenuPanel />
            ) : (
              <>
                <div
                  data-testid="menu-list"
                  className="flex flex-col gap-2.5 pb-16 md:hidden"
                >
                  <AnimatedMenuSlots
                    slots={slots}
                    undoTile={undoTile}
                    renderEntry={(entry, index) => (
                      <MobileRecipeRow
                        recipe={entry.recipe}
                        from="/menu"
                        onRemoveFromMenu={() => remove(entry, index)}
                      />
                    )}
                  />
                </div>
                <div
                  data-testid="menu-grid"
                  className="hidden grid-cols-2 gap-4 md:grid xl:grid-cols-3"
                >
                  <AnimatedMenuSlots
                    slots={slots}
                    undoTile={undoTile}
                    renderEntry={(entry, index) => (
                      <RecipeCard
                        recipe={entry.recipe}
                        from="/menu"
                        onRemoveFromMenu={() => remove(entry, index)}
                      />
                    )}
                  />
                </div>
              </>
            ))}
        </motion.div>
        {entries && <MenuFooterPill recipeCount={entries.length} />}
      </div>
      <div className="hidden min-w-0 md:block lg:-mx-1 lg:h-full lg:px-1 lg:pt-1 lg:pb-6">
        <ShoppingListPanel />
      </div>
      <ShoppingListSheet />
    </div>
  );
}
