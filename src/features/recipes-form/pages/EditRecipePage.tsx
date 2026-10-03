import { LoadErrorPanel } from "@/components/LoadErrorPanel";
import { RouteFallback } from "@/components/RouteFallback";
import { useAuth } from "@/features/auth/components/AuthContext";
import type { User } from "@/features/auth/data/types";
import { getRecipe } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import type { RecipeDetail } from "@/features/recipes/data/types";
import { canManageRecipe } from "@/features/recipes/hooks/useRecipePermissions";
import { ApiError } from "@/lib/http/client";
import { useApiQuery } from "@/lib/tanstack/useApiQuery";
import { Navigate, useParams } from "react-router-dom";

import { RecipeForm } from "../components/RecipeForm";
import { useUpdateRecipe } from "../hooks/useUpdateRecipe";
import { fromDetail } from "../utils/fromDetail";
import { toRequest } from "../utils/toRequest";

function EditRecipeForm({
  recipe,
  user,
}: {
  recipe: RecipeDetail;
  user: User | null;
}) {
  const updateRecipe = useUpdateRecipe(recipe.id);
  const losesApproval = recipe.approved && user?.role !== "ADMIN";

  return (
    <RecipeForm
      title="Edit recipe"
      backTo={`/recipes/${recipe.id}`}
      defaultValues={fromDetail(recipe)}
      submitLabel="Save changes"
      pendingLabel="Saving…"
      footerNote={
        losesApproval ? "Saving sends this back for approval." : undefined
      }
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
  const {
    data: recipe,
    error,
    isPending,
    refetch,
  } = useApiQuery({
    queryKey: recipeKeys.detail(recipeId),
    queryFn: () => getRecipe(recipeId),
  });
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

  return <EditRecipeForm recipe={recipe} user={user} />;
}

export function EditRecipeRoute() {
  const { id } = useParams();
  if (!id) return <Navigate to="/recipes" replace />;
  return <EditRecipePage recipeId={id} />;
}
