import { EmptyTabPanel } from "@/components/feedback/EmptyTabPanel";
import { AddRecipeLink } from "@/components/nav/AddRecipeLink";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";

import { LibraryRecipeList } from "../components/LibraryRecipeList";
import { useMyRecipes } from "../hooks/useMyRecipes";

export function MyRecipesPage() {
  return (
    <LibraryRecipeList
      query={useMyRecipes()}
      what="your recipes"
      loadingLabel="Loading your recipes…"
      from="/library/my-recipes"
      empty={
        <EmptyTabPanel
          icon={ChefHat}
          heading="No recipes of your own yet"
          description="Recipes you create live here, ready to add to your menu."
          action={
            <Button asChild>
              <AddRecipeLink>Create a recipe</AddRecipeLink>
            </Button>
          }
        />
      }
    />
  );
}
