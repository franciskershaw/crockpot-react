import { LoadErrorPanel } from "@/components/LoadErrorPanel";
import { RouteFallback } from "@/components/RouteFallback";
import { useAuth } from "@/features/auth/components/AuthContext";
import type { RecipeDetail } from "@/features/recipes/data/types";
import { useRecipe } from "@/features/recipes/hooks/useRecipe";
import { canManageRecipe } from "@/features/recipes/hooks/useRecipePermissions";
import { ApiError } from "@/lib/http/client";
import { Navigate, useParams } from "react-router-dom";

import { RecipeForm } from "../components/RecipeForm";
import { useUpdateRecipe } from "../hooks/useUpdateRecipe";
import { fromDetail } from "../utils/fromDetail";
import { toRequest } from "../utils/toRequest";

function EditRecipeForm({ recipe }: { recipe: RecipeDetail }) {
  const updateRecipe = useUpdateRecipe(recipe.id);

  return (
    <RecipeForm
      title="Edit recipe"
      backTo={`/recipes/${recipe.id}`}
      defaultValues={fromDetail(recipe)}
      submitLabel="Save changes"
      pendingLabel="Saving…"
      isPending={updateRecipe.isPending}
      error={updateRecipe.error}
      onSubmit={(values, done) =>
        updateRecipe.mutate(
          toRequest(values, { hadImage: recipe.imageUrl !== null }),
          {
            onSuccess: () => done(recipe.id),
          },
        )
      }
    />
  );
}

export function EditRecipePage({ recipeId }: { recipeId: string }) {
  const { data: recipe, error, isPending, refetch } = useRecipe(recipeId);
  const { user } = useAuth();

  if (isPending) return <RouteFallback />;

  if (error instanceof ApiError && error.status === 404) {
    return <Navigate to={`/recipes/${recipeId}`} replace />;
  }

  if (error) {
    return <LoadErrorPanel what="this recipe" onRetry={() => refetch()} />;
  }

  if (!canManageRecipe(recipe, user)) {
    return <Navigate to={`/recipes/${recipeId}`} replace />;
  }

  return <EditRecipeForm recipe={recipe} />;
}

export function EditRecipeRoute() {
  const { id } = useParams();
  if (!id) return <Navigate to="/recipes" replace />;
  return <EditRecipePage recipeId={id} />;
}
