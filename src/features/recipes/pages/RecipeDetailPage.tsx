import { StatePanel } from "@/components/StatePanel";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/http/client";
import { useApiQuery } from "@/lib/Tanstack/useApiQuery";
import { AlertTriangle, ChefHat } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import { getRecipe } from "../api";
import { AddToMenuCTA } from "../components/AddToMenuCTA";
import { RecipeBackButton } from "../components/RecipeBackButton";
import { recipeKeys } from "../queryKeys";

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
  return (
    <div className="relative min-h-40">
      <RecipeBackButton />
      <div className="flex flex-col items-start gap-4 pt-16 pl-4">
        <div>{recipe.name}</div>
        <AddToMenuCTA recipe={recipe} variant="desktop" />
      </div>
    </div>
  );
}

export function RecipeDetailRoute() {
  const { id } = useParams();
  if (!id) return <Navigate to="/recipes" replace />;
  return <RecipeDetailPage recipeId={id} />;
}
