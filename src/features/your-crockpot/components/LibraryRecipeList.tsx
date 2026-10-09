import type { ReactNode } from "react";
import { LoadErrorPanel } from "@/components/LoadErrorPanel";
import { LoadMoreSentinel } from "@/components/LoadMoreSentinel";
import { RecipeListGrid } from "@/features/recipes/components/RecipeListGrid";
import { SCROLL_PANE_CLASSES } from "@/lib/styles";
import { buildUndoSlots } from "@/lib/undoSlots";
import { useLoadMoreOnSentinel } from "@/lib/useLoadMoreOnSentinel";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

import type { useLibraryRecipes } from "../hooks/useLibraryRecipes";
import { LibraryListSkeleton } from "./LibraryListSkeleton";

export function LibraryRecipeList({
  query,
  what,
  loadingLabel,
  from,
  empty,
}: {
  query: ReturnType<typeof useLibraryRecipes>;
  what: string;
  loadingLabel: string;
  from: string;
  empty: ReactNode;
}) {
  const { data, isError, refetch, hasNextPage, isFetching, loadMore } = query;
  const recipes = data?.pages.flatMap((page) => page.recipes);
  const sentinelRef = useLoadMoreOnSentinel({
    hasNextPage,
    isFetching,
    isError,
    loadMore,
  });

  return (
    <motion.div layoutScroll className={cn(SCROLL_PANE_CLASSES, "lg:pb-10")}>
      {!recipes ? (
        isError ? (
          <LoadErrorPanel what={what} onRetry={() => refetch()} />
        ) : (
          <LibraryListSkeleton label={loadingLabel} />
        )
      ) : recipes.length === 0 ? (
        empty
      ) : (
        <>
          <RecipeListGrid
            slots={buildUndoSlots(recipes, (recipe) => recipe.id, [])}
            itemProps={(slot) => ({ recipe: slot.item, from })}
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
