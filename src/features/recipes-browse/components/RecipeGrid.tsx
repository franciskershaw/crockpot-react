import { useCallback, useEffect, useState } from "react";
import { StatePanel } from "@/components/StatePanel";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { RecipeCardSkeleton } from "@/features/recipes/components/RecipeCardSkeleton";
import type { RecipeListParams } from "@/features/recipes/data/types";
import { AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { useRecipeList } from "../hooks/useRecipeList";
import { EmptyRecipes } from "./EmptyRecipes";
import { ResponsiveRecipeGrid } from "./ResponsiveRecipeGrid";

const INITIAL_SKELETON_COUNT = 6;
const NEXT_PAGE_SKELETON_COUNT = 3;
// Start fetching about a viewport before the end so the next page is usually
// there by the time the user arrives.
const PREFETCH_MARGIN = "100% 0px";
// Matches ResponsiveRecipeGrid's widest breakpoint (xl:grid-cols-3) — these
// are above the fold on first paint, so they shouldn't wait on loading="lazy".
const PRIORITY_CARD_COUNT = 3;

export function RecipeGrid({
  params,
  from,
  activeFilterCount,
  onClearFilters,
}: {
  params: RecipeListParams;
  from: string;
  activeFilterCount: number;
  onClearFilters: () => void;
}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useRecipeList(params);

  // Cards already cached when the grid mounts (e.g. returning from a recipe
  // detail page) render settled instead of replaying the entrance.
  const [settledIds] = useState(
    () => new Set(data?.pages.flatMap((page) => page.recipes.map((r) => r.id))),
  );

  const [sentinelInView, setSentinelInView] = useState(false);

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) =>
        setSentinelInView(entries[entries.length - 1].isIntersecting),
      { rootMargin: PREFETCH_MARGIN },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      setSentinelInView(false);
    };
  }, []);

  // Driven by state, not observer events: an event dropped while a fetch was
  // running is never repeated while the sentinel stays in view.
  useEffect(() => {
    if (sentinelInView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [sentinelInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <ResponsiveRecipeGrid>
        {Array.from({ length: INITIAL_SKELETON_COUNT }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </ResponsiveRecipeGrid>
    );
  }

  if (isError) {
    return (
      <StatePanel
        icon={AlertTriangle}
        heading="Something went wrong"
        description="We couldn't load recipes. Check your connection and try again."
        actions={<Button onClick={() => refetch()}>Retry</Button>}
      />
    );
  }

  if (!data) return null;

  const recipes = data.pages.flatMap((page) => page.recipes);

  if (recipes.length === 0) {
    return (
      <EmptyRecipes
        activeFilterCount={activeFilterCount}
        onClearFilters={onClearFilters}
      />
    );
  }

  const previousPagesCount = data.pages
    .slice(0, -1)
    .reduce((sum, page) => sum + page.recipes.length, 0);

  const selectedCategoryCount = params.categoryIds?.length ?? 0;
  const selectedIngredientCount = params.ingredientIds?.length ?? 0;

  return (
    <ResponsiveRecipeGrid>
      {recipes.map((recipe, index) => {
        const isNewItem = index >= previousPagesCount;
        const newItemIndex = isNewItem ? index - previousPagesCount : 0;

        return (
          <motion.div
            key={recipe.id}
            initial={settledIds.has(recipe.id) ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: isNewItem
                ? newItemIndex * 0.08 + 0.1
                : Math.min(index * 0.03, 0.3),
              duration: 0.35,
              ease: "easeOut",
            }}
          >
            <RecipeCard
              recipe={recipe}
              from={from}
              priority={index < PRIORITY_CARD_COUNT}
              selectedCategoryCount={selectedCategoryCount}
              selectedIngredientCount={selectedIngredientCount}
            />
          </motion.div>
        );
      })}

      <AnimatePresence>
        {isFetchingNextPage &&
          Array.from({ length: NEXT_PAGE_SKELETON_COUNT }).map((_, i) => (
            <motion.div
              key={`next-page-skeleton-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
            >
              <RecipeCardSkeleton />
            </motion.div>
          ))}
      </AnimatePresence>

      {hasNextPage && <div ref={sentinelRef} className="col-span-full h-1" />}
    </ResponsiveRecipeGrid>
  );
}
