import { useAuth } from "@/features/auth/components/AuthContext";

import type { RecipeDetail } from "../data/types";
import { canManageRecipe } from "../utils/recipePermissions";

export interface RecipePermissions {
  canManage: boolean;
}

export function useRecipePermissions(recipe: RecipeDetail): RecipePermissions {
  const { user } = useAuth();
  return {
    canManage: canManageRecipe(recipe, user),
  };
}
