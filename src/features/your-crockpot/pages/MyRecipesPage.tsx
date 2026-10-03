import { EmptyTabPanel } from "@/components/EmptyTabPanel";
import { LoadErrorPanel } from "@/components/LoadErrorPanel";
import { AddRecipeLink } from "@/components/nav/AddRecipeLink";
import { RecipeListGrid } from "@/features/recipes/components/RecipeListGrid";
import { PILL_CTA_CLASSES, SCROLL_PANE_CLASSES } from "@/lib/styles";
import { buildUndoSlots } from "@/lib/undoSlots";
import { cn } from "@/lib/utils";
import { ChefHat } from "lucide-react";
import { motion } from "motion/react";

import { LibraryListSkeleton } from "../components/LibraryListSkeleton";
import { useLoadMoreOnSentinel } from "../hooks/useLoadMoreOnSentinel";
import { useMyRecipes } from "../hooks/useMyRecipes";

const FROM = "/library/my-recipes";

export function MyRecipesPage() {
  const { data, isError, refetch, hasNextPage, isFetching, loadMore } =
    useMyRecipes();
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
          <LoadErrorPanel what="your recipes" onRetry={() => refetch()} />
        ) : (
          <LibraryListSkeleton label="Loading your recipes…" />
        )
      ) : recipes.length === 0 ? (
        <EmptyTabPanel
          icon={ChefHat}
          heading="No recipes of your own yet"
          description="Recipes you create live here, ready to add to your menu."
          action={
            <AddRecipeLink className={PILL_CTA_CLASSES}>
              Create a recipe
            </AddRecipeLink>
          }
        />
      ) : (
        <>
          <RecipeListGrid
            slots={buildUndoSlots(recipes, (recipe) => recipe.id, [])}
            itemProps={(slot) => ({ recipe: slot.item, from: FROM })}
          />
          {hasNextPage && <div ref={sentinelRef} className="h-1" />}
        </>
      )}
    </motion.div>
  );
}
