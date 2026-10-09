import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/components/AuthContext";
import type { RecipeDetail } from "@/features/recipes/data/types";
import { pendingApprovalViewer } from "@/features/recipes/hooks/useRecipePermissions";
import { Clock } from "lucide-react";

import { isRecipeChanged, useApproveRecipe } from "../hooks/useApproveRecipe";

export function RecipePendingApprovalBanner({
  recipe,
}: {
  recipe: RecipeDetail;
}) {
  const { user } = useAuth();
  const viewer = pendingApprovalViewer(recipe, user);
  const approve = useApproveRecipe(recipe.id);

  if (!viewer) return null;

  const message =
    viewer === "owner"
      ? "Pending approval — visible only to you until an admin approves it"
      : isRecipeChanged(approve.error)
        ? "This recipe changed since you opened it — check it again"
        : "Pending approval — check the photo and details before approving";

  return (
    <div className="border-b border-category-chip-border bg-category-chip-bg px-6 py-3 text-category-chip-text">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-sm font-medium">
        <div className="flex items-center gap-2">
          <Clock size={16} strokeWidth={2} className="shrink-0" />
          {message}
        </div>
        {viewer === "admin" && (
          <Button
            size="sm"
            onClick={() => approve.mutate(recipe.updatedAt)}
            disabled={approve.isPending}
          >
            Approve
          </Button>
        )}
      </div>
    </div>
  );
}
