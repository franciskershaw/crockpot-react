import { useAuth } from "@/features/auth/components/AuthContext";

import { canManageRecipe } from "../utils/recipePermissions";

export interface RecipePermissions {
  canManage: boolean;
}

export function useRecipePermissions(
  recipe: Parameters<typeof canManageRecipe>[0],
): RecipePermissions {
  const { user } = useAuth();
  return {
    canManage: canManageRecipe(recipe, user),
  };
}
