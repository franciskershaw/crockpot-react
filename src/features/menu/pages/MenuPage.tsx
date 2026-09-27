import { AnimatedSlots } from "@/components/AnimatedSlots";
import { EmptyTabPanel } from "@/components/EmptyTabPanel";
import { StatePanel } from "@/components/StatePanel";
import { Button } from "@/components/ui/button";
import { UndoTile } from "@/components/UndoTile";
import { MobileRecipeRow } from "@/features/recipes/components/MobileRecipeRow";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { ShoppingListPanel } from "@/features/shopping-list/components/ShoppingListPanel";
import { ShoppingListSheet } from "@/features/shopping-list/components/ShoppingListSheet";
import { buildUndoSlots, type UndoSlot } from "@/lib/undoSlots";
import { AlertTriangle, ChefHat } from "lucide-react";
import { motion } from "motion/react";

import { MenuFooterPill } from "../components/MenuFooterPill";
import { MenuSkeleton } from "../components/MenuSkeleton";
import type { MenuEntry } from "../data/types";
import { useMenu } from "../hooks/useMenu";
import { useUndoableMenuRemoval } from "../hooks/useUndoableMenuRemoval";

export function MenuPage() {
  const { data: menu, isError, refetch } = useMenu();
  const entries = menu?.entries;
  const { removals, remove, canUndo, undo } = useUndoableMenuRemoval();
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
    />
  );

  return (
    <div className="grid grid-cols-1 items-start gap-6.5 lg:h-full lg:grid-cols-[1fr_372px] lg:grid-rows-1 lg:items-stretch">
      <div className="relative min-w-0 lg:h-full">
        <motion.div
          layoutScroll
          className="lg:-mx-1 lg:h-full lg:overflow-y-auto lg:px-1 lg:pt-1 lg:pb-28"
        >
          {!entries ? (
            isError ? (
              <StatePanel
                icon={AlertTriangle}
                heading="Something went wrong"
                description="We couldn't load your menu. Check your connection and try again."
                actions={<Button onClick={() => refetch()}>Retry</Button>}
              />
            ) : (
              <MenuSkeleton />
            )
          ) : entries.length === 0 && !showUndo ? (
            <EmptyTabPanel
              icon={ChefHat}
              heading="Nothing on the menu yet"
              description="Tap the basket on any recipe you fancy and it lands here. Your shopping list builds itself from whatever you add."
            />
          ) : (
            <>
              <div
                data-testid="menu-list"
                className="flex flex-col gap-2.5 pb-16 md:hidden"
              >
                <AnimatedSlots
                  slots={slots}
                  renderUndo={renderUndo}
                  renderItem={(slot) => (
                    <MobileRecipeRow
                      recipe={slot.item.recipe}
                      from="/menu"
                      onRemoveFromMenu={() =>
                        remove(slot.item, slot.anchorKey, slot.index)
                      }
                    />
                  )}
                />
              </div>
              <div
                data-testid="menu-grid"
                className="hidden grid-cols-2 gap-4 md:grid xl:grid-cols-3"
              >
                <AnimatedSlots
                  slots={slots}
                  renderUndo={renderUndo}
                  renderItem={(slot) => (
                    <RecipeCard
                      recipe={slot.item.recipe}
                      from="/menu"
                      onRemoveFromMenu={() =>
                        remove(slot.item, slot.anchorKey, slot.index)
                      }
                    />
                  )}
                />
              </div>
            </>
          )}
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
