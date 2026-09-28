import { EmptyTabPanel } from "@/components/EmptyTabPanel";
import { AddRecipeLink } from "@/components/nav/AddRecipeLink";
import { MobileRecipeRow } from "@/features/recipes/components/MobileRecipeRow";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { PILL_CTA_CLASSES } from "@/lib/styles";
import { ChefHat } from "lucide-react";

import { useMyRecipes } from "../hooks/useMyRecipes";
import { FAVOURITES_GRID_CLASSES } from "../utils/styles";

const FROM = "/library/my-recipes";

export function MyRecipesPage() {
  const { data } = useMyRecipes();
  const recipes = data?.pages.flatMap((page) => page.recipes);

  return (
    <div className="lg:-mx-1 lg:h-full lg:overflow-y-auto lg:px-1 lg:pt-1 lg:pb-10">
      {!recipes ? null : recipes.length === 0 ? (
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
          <div className={FAVOURITES_GRID_CLASSES}>
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} from={FROM} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
