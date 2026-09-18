import { useAuth } from "@/features/auth/components/AuthContext";
import type { User } from "@/features/auth/types";

import type { RecipeDetail } from "../types";

export function canManageRecipe(
  recipe: Pick<RecipeDetail, "createdById">,
  user: User | null,
): boolean {
  if (!user) return false;
  return user.role === "ADMIN" || user.id === recipe.createdById;
}

export function isOwnPendingRecipe(
  recipe: Pick<RecipeDetail, "approved" | "createdById">,
  user: User | null,
): boolean {
  if (!user) return false;
  return !recipe.approved && user.id === recipe.createdById;
}

export interface RecipePermissions {
  canManage: boolean;
  isOwnPendingApproval: boolean;
}

export function useRecipePermissions(recipe: RecipeDetail): RecipePermissions {
  const { user } = useAuth();
  return {
    canManage: canManageRecipe(recipe, user),
    isOwnPendingApproval: isOwnPendingRecipe(recipe, user),
  };
}
