import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

import { useRecipeList } from "../hooks/useRecipeList";
import type { RecipeListParams } from "../types";
import { EmptyRecipes } from "./EmptyRecipes";
import { RecipeCard } from "./RecipeCard";
import { RecipeCardSkeleton } from "./RecipeCardSkeleton";
import { ResponsiveRecipeGrid } from "./ResponsiveRecipeGrid";

const INITIAL_SKELETON_COUNT = 6;
const NEXT_PAGE_SKELETON_COUNT = 3;
const INTERSECTION_DEBOUNCE_MS = 500;

export function RecipeGrid({
  params,
  activeFilterCount,
  onClearFilters,
}: {
  params: RecipeListParams;
  activeFilterCount: number;
  onClearFilters: () => void;
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useRecipeList(params);

  const lastTriggerRef = useRef(0);
  const latestRef = useRef({ hasNextPage, isFetchingNextPage, fetchNextPage });
  useEffect(() => {
    latestRef.current = { hasNextPage, isFetchingNextPage, fetchNextPage };
  });

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const { hasNextPage, isFetchingNextPage, fetchNextPage } =
          latestRef.current;
        if (!entries[0].isIntersecting || !hasNextPage || isFetchingNextPage) {
          return;
        }
        const now = Date.now();
        if (now - lastTriggerRef.current < INTERSECTION_DEBOUNCE_MS) return;
        lastTriggerRef.current = now;
        fetchNextPage();
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (isLoading) {
    return (
      <ResponsiveRecipeGrid>
        {Array.from({ length: INITIAL_SKELETON_COUNT }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </ResponsiveRecipeGrid>
    );
  }

  // No data means the request failed — useApiInfiniteQuery already
  // surfaced the error toast.
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

  return (
    <ResponsiveRecipeGrid>
      {recipes.map((recipe, index) => {
        const isNewItem = index >= previousPagesCount;
        const newItemIndex = isNewItem ? index - previousPagesCount : 0;

        return (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: isNewItem
                ? newItemIndex * 0.08 + 0.1
                : Math.min(index * 0.03, 0.3),
              duration: 0.35,
              ease: "easeOut",
            }}
          >
            <RecipeCard recipe={recipe} />
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
