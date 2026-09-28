import { EmptyTabPanel } from "@/components/EmptyTabPanel";
import { AddRecipeLink } from "@/components/nav/AddRecipeLink";
import { StatePanel } from "@/components/StatePanel";
import { Button } from "@/components/ui/button";
import { MobileRecipeRow } from "@/features/recipes/components/MobileRecipeRow";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { PILL_CTA_CLASSES } from "@/lib/styles";
import { AlertTriangle, ChefHat } from "lucide-react";

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
    <div className="lg:-mx-1 lg:h-full lg:overflow-y-auto lg:px-1 lg:pt-1 lg:pb-10">
      {!recipes ? (
        isError ? (
          <StatePanel
            icon={AlertTriangle}
            heading="Something went wrong"
            description="We couldn't load your recipes. Check your connection and try again."
            actions={<Button onClick={() => refetch()}>Retry</Button>}
          />
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
