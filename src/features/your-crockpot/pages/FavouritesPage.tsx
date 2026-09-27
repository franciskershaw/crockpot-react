import { useEffect, useRef } from "react";
import { AnimatedSlots } from "@/components/AnimatedSlots";
import { EmptyTabPanel } from "@/components/EmptyTabPanel";
import { StatePanel } from "@/components/StatePanel";
import { Button } from "@/components/ui/button";
import { UndoTile } from "@/components/UndoTile";
import { MobileRecipeRow } from "@/features/recipes/components/MobileRecipeRow";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import type { RecipeCard as RecipeCardData } from "@/features/recipes/data/types";
import { PILL_CTA_CLASSES } from "@/lib/styles";
import { buildUndoSlots, type UndoSlot } from "@/lib/undoSlots";
import { useSentinelInView } from "@/lib/useSentinelInView";
import { AlertTriangle, Heart } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

import { FavouritesSkeleton } from "../components/FavouritesSkeleton";
import { useFavourites } from "../hooks/useFavourites";
import { useUndoableFavouriteRemoval } from "../hooks/useUndoableFavouriteRemoval";
import { FAVOURITES_GRID_CLASSES } from "../utils/styles";

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

  const { sentinelRef, inView } = useSentinelInView();
  // After a failed fetch (a page, or refreshing a stale list), only scrolling away and back retries it.
  const leftViewSinceLastLoad = useRef(false);

  useEffect(() => {
    if (!inView) leftViewSinceLastLoad.current = true;
  }, [inView]);

  useEffect(() => {
    if (!inView || !hasNextPage) return;
    if (isError && !leftViewSinceLastLoad.current) return;
    leftViewSinceLastLoad.current = false;
    loadMore();
  }, [inView, hasNextPage, isFetching, isError, changesInFlight, loadMore]);

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
    <motion.div
      layoutScroll
      className="lg:-mx-1 lg:h-full lg:overflow-y-auto lg:px-1 lg:pt-1 lg:pb-10"
    >
      {!recipes ? (
        isError ? (
          <StatePanel
            icon={AlertTriangle}
            heading="Something went wrong"
            description="We couldn't load your favourites. Check your connection and try again."
            actions={<Button onClick={() => refetch()}>Retry</Button>}
          />
        ) : (
          <FavouritesSkeleton />
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
          <div
            data-testid="favourites-list"
            className="flex flex-col gap-2.5 md:hidden"
          >
            <AnimatedSlots
              slots={slots}
              renderUndo={renderUndo}
              renderItem={(slot) => (
                <MobileRecipeRow
                  recipe={slot.item}
                  from="/favourites"
                  onUnfavourite={() =>
                    remove(slot.item, slot.anchorKey, slot.index)
                  }
                />
              )}
            />
          </div>
          <div
            data-testid="favourites-grid"
            className={FAVOURITES_GRID_CLASSES}
          >
            <AnimatedSlots
              slots={slots}
              renderUndo={renderUndo}
              renderItem={(slot) => (
                <RecipeCard
                  recipe={slot.item}
                  from="/favourites"
                  onUnfavourite={() =>
                    remove(slot.item, slot.anchorKey, slot.index)
                  }
                />
              )}
            />
          </div>
          {hasNextPage && <div ref={sentinelRef} className="h-1" />}
        </>
      )}
    </motion.div>
  );
}
