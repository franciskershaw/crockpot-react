import { EmptyTabPanel } from "@/components/EmptyTabPanel";
import { LoadErrorPanel } from "@/components/LoadErrorPanel";
import { AddRecipeLink } from "@/components/nav/AddRecipeLink";
import { MobileRecipeRow } from "@/features/recipes/components/MobileRecipeRow";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { PILL_CTA_CLASSES, SCROLL_PANE_CLASSES } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { ChefHat } from "lucide-react";

import { LibraryListSkeleton } from "../components/LibraryListSkeleton";
import { useLoadMoreOnSentinel } from "../hooks/useLoadMoreOnSentinel";
import { useMyRecipes } from "../hooks/useMyRecipes";
import { LIBRARY_GRID_CLASSES } from "../utils/styles";

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
    <div className={cn(SCROLL_PANE_CLASSES, "lg:pb-10")}>
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
          <div className="flex flex-col gap-2.5 md:hidden">
            {recipes.map((recipe) => (
              <MobileRecipeRow key={recipe.id} recipe={recipe} from={FROM} />
            ))}
          </div>
          <div className={LIBRARY_GRID_CLASSES}>
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} from={FROM} />
            ))}
          </div>
          {hasNextPage && <div ref={sentinelRef} className="h-1" />}
        </>
      )}
    </div>
  );
}
