import { useEffect, useRef } from "react";
import { AnimatedSlots, type Slot } from "@/components/AnimatedSlots";
import { EmptyTabPanel } from "@/components/EmptyTabPanel";
import { StatePanel } from "@/components/StatePanel";
import { Button } from "@/components/ui/button";
import { UndoTile } from "@/components/UndoTile";
import { MobileRecipeRow } from "@/features/recipes/components/MobileRecipeRow";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import type { RecipeCard as RecipeCardData } from "@/features/recipes/data/types";
import { PILL_CTA_CLASSES } from "@/lib/styles";
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
    isFetchNextPageError,
    changesInFlight,
    loadMore,
  } = useFavourites();
  const recipes = data?.pages.flatMap((page) => page.recipes);
  const { removed, canUndo, remove, undo } = useUndoableFavouriteRemoval();
  const showUndo =
    removed !== null &&
    !recipes?.some((recipe) => recipe.id === removed.recipe.id);

  const { sentinelRef, inView } = useSentinelInView();
  // After a failed page, only scrolling away and back retries it — never a loop.
  const leftViewSinceLastLoad = useRef(false);

  useEffect(() => {
    if (!inView) leftViewSinceLastLoad.current = true;
  }, [inView]);

  useEffect(() => {
    if (!inView || !hasNextPage) return;
    if (isFetchNextPageError && !leftViewSinceLastLoad.current) return;
    leftViewSinceLastLoad.current = false;
    loadMore();
  }, [
    inView,
    hasNextPage,
    isFetching,
    isFetchNextPageError,
    changesInFlight,
    loadMore,
  ]);

  const slots: Slot<RecipeCardData>[] =
    recipes?.map((recipe, index) => ({
      key: recipe.id,
      item: recipe,
      index,
    })) ?? [];
  if (removed && showUndo) {
    slots.splice(removed.index, 0, {
      key: removed.recipe.id,
      item: null,
      index: removed.index,
    });
  }

  const undoTile = removed && (
    <UndoTile title={removed.recipe.name} canUndo={canUndo} onUndo={undo} />
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
              undoTile={undoTile}
              renderItem={(recipe, index) => (
                <MobileRecipeRow
                  recipe={recipe}
                  from="/favourites"
                  onUnfavourite={() => remove(recipe, index)}
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
              undoTile={undoTile}
              renderItem={(recipe, index) => (
                <RecipeCard
                  recipe={recipe}
                  from="/favourites"
                  onUnfavourite={() => remove(recipe, index)}
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
