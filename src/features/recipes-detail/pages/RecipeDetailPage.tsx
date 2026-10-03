import { LoadErrorPanel } from "@/components/LoadErrorPanel";
import { StatePanel } from "@/components/StatePanel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/components/AuthContext";
import { getRecipe } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import { isOwnPendingRecipe } from "@/features/recipes/hooks/useRecipePermissions";
import { ApiError } from "@/lib/http/client";
import { useApiQuery } from "@/lib/tanstack/useApiQuery";
import { ChefHat } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import { RecipeContent } from "../components/RecipeContent";
import { RecipeDetailSkeleton } from "../components/RecipeDetailSkeleton";
import { RecipeHero } from "../components/RecipeHero";
import { RecipePendingApprovalBanner } from "../components/RecipePendingApprovalBanner";
import { useStickyHeroTrigger } from "../hooks/useStickyHeroTrigger";

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
  const { sentinelRef, isStuck } = useStickyHeroTrigger();
  const { user, isAuthenticated } = useAuth();

  if (isPending) return <RecipeDetailSkeleton />;

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
    return <LoadErrorPanel what="this recipe" onRetry={() => refetch()} />;
  }

  return (
    <div>
      {isOwnPendingRecipe(recipe, user) && <RecipePendingApprovalBanner />}
      <RecipeHero
        recipe={recipe}
        hasActionBar={isAuthenticated}
        sentinelRef={sentinelRef}
        isStuck={isStuck}
      />
      {recipe.description && (
        <p className="mx-auto max-w-2xl px-6 py-10 text-center text-lg italic text-muted-foreground">
          {recipe.description}
        </p>
      )}
      <RecipeContent
        recipe={recipe}
        hasActionBar={isAuthenticated}
        isStuck={isStuck}
      />
    </div>
  );
}

export function RecipeDetailRoute() {
  const { id } = useParams();
  if (!id) return <Navigate to="/recipes" replace />;
  return <RecipeDetailPage recipeId={id} />;
}
