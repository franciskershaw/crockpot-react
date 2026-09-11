import { StatePanel } from "@/components/StatePanel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/components/AuthContext";
import { ApiError } from "@/lib/http/client";
import { useApiQuery } from "@/lib/Tanstack/useApiQuery";
import { AlertTriangle, ChefHat } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import { getRecipe } from "../api";
import { AddToMenuCTA } from "../components/add-to-menu/AddToMenuCTA";
import { RecipeBackButton } from "../components/RecipeBackButton";
import { RecipeDeleteButton } from "../components/RecipeDeleteButton";
import { RecipeEditButton } from "../components/RecipeEditButton";
import { RecipeFavouriteButton } from "../components/RecipeFavouriteButton";
import { useRecipeBackDestination } from "../hooks/useRecipeBackDestination";
import { useRecipePermissions } from "../hooks/useRecipePermissions";
import { recipeKeys } from "../queryKeys";
import type { RecipeDetail } from "../types";

export function RecipeDetailPage({ recipeId }: { recipeId: string }) {
  const {
    data: recipe,
    error,
    isPending,
    refetch,
  } = useApiQuery({
    queryKey: recipeKeys.detail(recipeId),
    queryFn: () => getRecipe(recipeId),
  });

  if (isPending) return null;

  if (error instanceof ApiError && error.status === 404) {
    return (
      <StatePanel
        icon={ChefHat}
        heading="Recipe not found"
        description="This recipe doesn't exist, or isn't available to view."
        actions={
          <Button asChild>
            <Link to="/recipes">Back to recipes</Link>
          </Button>
        }
      />
    );
  }

  if (error) {
    return (
      <StatePanel
        icon={AlertTriangle}
        heading="Something went wrong"
        description="We couldn't load this recipe. Check your connection and try again."
        actions={<Button onClick={() => refetch()}>Retry</Button>}
      />
    );
  }

  // Temporary minimal composition for sanity-checking pieces in isolation —
  // the actual hero/action-row lands in a later piece.
  return <RecipeDetailPageContent recipe={recipe} />;
}

function RecipeDetailPageContent({ recipe }: { recipe: RecipeDetail }) {
  const { isAuthenticated } = useAuth();
  const permissions = useRecipePermissions(recipe);
  const { to } = useRecipeBackDestination();

  return (
    <div className="relative min-h-40">
      <RecipeBackButton />
      <div className="flex flex-col items-start gap-4 pt-16 pl-4">
        <div>{recipe.name}</div>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <RecipeFavouriteButton
              recipe={recipe}
              className="border border-border bg-card"
            />
          )}
          {permissions.canManage && (
            <>
              <RecipeEditButton
                recipeId={recipe.id}
                className="border border-border bg-card"
              />
              <RecipeDeleteButton
                recipeId={recipe.id}
                recipeName={recipe.name}
                to={to}
                className="border border-border bg-card"
              />
            </>
          )}
          <AddToMenuCTA recipe={recipe} variant="desktop" />
        </div>
      </div>
    </div>
  );
}

export function RecipeDetailRoute() {
  const { id } = useParams();
  if (!id) return <Navigate to="/recipes" replace />;
  return <RecipeDetailPage recipeId={id} />;
}
