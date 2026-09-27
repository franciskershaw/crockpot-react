import { AnimatedSlots, type Slot } from "@/components/AnimatedSlots";
import { EmptyTabPanel } from "@/components/EmptyTabPanel";
import { StatePanel } from "@/components/StatePanel";
import { Button } from "@/components/ui/button";
import { UndoTile } from "@/components/UndoTile";
import { MobileRecipeRow } from "@/features/recipes/components/MobileRecipeRow";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { ShoppingListPanel } from "@/features/shopping-list/components/ShoppingListPanel";
import { ShoppingListSheet } from "@/features/shopping-list/components/ShoppingListSheet";
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
  const { removed, canUndo, remove, undo } = useUndoableMenuRemoval();
  const showUndo =
    removed !== null &&
    !entries?.some((entry) => entry.recipeId === removed.entry.recipeId);

  const slots: Slot<MenuEntry>[] =
    entries?.map((entry, index) => ({
      key: entry.recipeId,
      item: entry,
      index,
    })) ?? [];
  if (removed && showUndo) {
    slots.splice(removed.index, 0, {
      key: removed.entry.recipeId,
      item: null,
      index: removed.index,
    });
  }

  const undoTile = removed && (
    <UndoTile
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
                  undoTile={undoTile}
                  renderItem={(entry, index) => (
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
                <AnimatedSlots
                  slots={slots}
                  undoTile={undoTile}
                  renderItem={(entry, index) => (
                    <RecipeCard
                      recipe={entry.recipe}
                      from="/menu"
                      onRemoveFromMenu={() => remove(entry, index)}
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
