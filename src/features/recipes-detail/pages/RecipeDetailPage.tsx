import { useState } from "react";
import { LoadErrorPanel } from "@/components/feedback/LoadErrorPanel";
import { StatePanel } from "@/components/feedback/StatePanel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/components/AuthContext";
import { useRecipe } from "@/features/recipes/hooks/useRecipe";
import { findCachedRecipeCard } from "@/features/recipes/utils/findCachedRecipeCard";
import { ApiError } from "@/lib/http/client";
import { useQueryClient } from "@tanstack/react-query";
import { ChefHat } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import { RecipeContent } from "../components/RecipeContent";
import {
  RecipeBodySkeleton,
  RecipeDetailSkeleton,
} from "../components/RecipeDetailSkeleton";
import { RecipeHero } from "../components/RecipeHero";
import { RecipePendingApprovalBanner } from "../components/RecipePendingApprovalBanner";
import { useStickyHeroTrigger } from "../hooks/useStickyHeroTrigger";

export function RecipeDetailPage({ recipeId }: { recipeId: string }) {
  const { data: recipe, error, isPending, refetch } = useRecipe(recipeId);
  const { sentinelRef, isStuck } = useStickyHeroTrigger();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  // Pending recipes add a banner and creator-only actions the card can't predict, so they wait.
  const [preview] = useState(() => {
    const card = findCachedRecipeCard(queryClient, recipeId);
    return card?.approved ? card : undefined;
  });

  if (isPending && !preview) return <RecipeDetailSkeleton />;

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
      {recipe && <RecipePendingApprovalBanner recipe={recipe} />}
      <RecipeHero
        recipe={recipe ?? preview!}
        hasActionBar={isAuthenticated}
        sentinelRef={sentinelRef}
        isStuck={isStuck}
      />
      {recipe ? (
        <>
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
        </>
      ) : (
        <RecipeBodySkeleton />
      )}
    </div>
  );
}

export function RecipeDetailRoute() {
  const { id } = useParams();
  if (!id) return <Navigate to="/recipes" replace />;
  return <RecipeDetailPage key={id} recipeId={id} />;
}
