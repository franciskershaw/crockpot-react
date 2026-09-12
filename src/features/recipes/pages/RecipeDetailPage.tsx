import { StatePanel } from "@/components/StatePanel";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/http/client";
import { useApiQuery } from "@/lib/Tanstack/useApiQuery";
import { AlertTriangle, ChefHat } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import { getRecipe } from "../api";
import { RecipeContent } from "../components/RecipeContent";
import { RecipeHero } from "../components/RecipeHero";
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

  return (
    <div>
      <RecipeHero recipe={recipe} />
      {recipe.description && (
        <p className="mx-auto max-w-2xl px-6 py-10 text-center text-lg italic text-muted-foreground">
          {recipe.description}
        </p>
      )}
      <RecipeContent recipe={recipe} />
    </div>
  );
}

export function RecipeDetailRoute() {
  const { id } = useParams();
  if (!id) return <Navigate to="/recipes" replace />;
  return <RecipeDetailPage recipeId={id} />;
}
