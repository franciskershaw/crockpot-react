import { EmptyTabPanel } from "@/components/feedback/EmptyTabPanel";
import { LoadErrorPanel } from "@/components/feedback/LoadErrorPanel";
import { LoadMoreSentinel } from "@/components/feedback/LoadMoreSentinel";
import { UndoTile } from "@/components/feedback/UndoTile";
import { RecipeListGrid } from "@/features/recipes/components/RecipeListGrid";
import type { RecipeCard as RecipeCardData } from "@/features/recipes/data/types";
import { PILL_CTA_CLASSES, SCROLL_PANE_CLASSES } from "@/lib/styles";
import { buildUndoSlots, type UndoSlot } from "@/lib/undoSlots";
import { useLoadMoreOnSentinel } from "@/lib/useLoadMoreOnSentinel";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

import { LibraryListSkeleton } from "../components/LibraryListSkeleton";
import { useFavourites } from "../hooks/useFavourites";
import { useUndoableFavouriteRemoval } from "../hooks/useUndoableFavouriteRemoval";

export function FavouritesPage() {
  const {
    data,
    isError,
    refetch,
    hasNextPage,
    isFetching,
    changesInFlight,
    loadMore,
  } = useFavourites();
  const recipes = data?.pages.flatMap((page) => page.recipes);
  const { removals, remove, canUndo, undo, ...countdown } =
    useUndoableFavouriteRemoval();
  const slots = buildUndoSlots(recipes ?? [], (recipe) => recipe.id, removals);
  const showUndo = slots.some((slot) => slot.undo);

  const sentinelRef = useLoadMoreOnSentinel({
    hasNextPage,
    isFetching,
    isError,
    changesInFlight,
    loadMore,
  });

  const renderUndo = (slot: UndoSlot<RecipeCardData>) => (
    <UndoTile
      title={slot.item.name}
      canUndo={canUndo(slot.key)}
      onUndo={() => undo(slot.key, slot.index)}
      paused={countdown.paused}
      countdownKey={countdown.generation}
      onPause={countdown.pause}
      onResume={countdown.resume}
    />
  );

  return (
    <motion.div layoutScroll className={cn(SCROLL_PANE_CLASSES, "lg:pb-10")}>
      {!recipes ? (
        isError ? (
          <LoadErrorPanel what="your favourites" onRetry={() => refetch()} />
        ) : (
          <LibraryListSkeleton label="Loading your favourites…" />
        )
      ) : recipes.length === 0 && !showUndo ? (
        <EmptyTabPanel
          icon={Heart}
          heading="No favourites yet"
          description="Tap the heart on any recipe you love and it's saved here for next time."
          action={
            <Link to="/recipes" className={PILL_CTA_CLASSES}>
              Browse recipes
            </Link>
          }
        />
      ) : (
        <>
          <RecipeListGrid
            slots={slots}
            renderUndo={renderUndo}
            testId="favourites"
            itemProps={(slot) => ({
              recipe: slot.item,
              from: "/library/favourites",
              onUnfavourite: () =>
                remove(slot.item, slot.anchorKey, slot.index),
            })}
          />
          <LoadMoreSentinel
            sentinelRef={sentinelRef}
            hasNextPage={hasNextPage}
            isError={isError}
            isFetching={isFetching}
            onRetry={loadMore}
          />
        </>
      )}
    </motion.div>
  );
}
