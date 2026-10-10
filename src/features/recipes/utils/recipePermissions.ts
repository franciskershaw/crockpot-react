import type { User } from "@/features/auth/data/types";
import { isAdmin } from "@/features/auth/utils/isAdmin";

import type { RecipeDetail } from "../data/types";

export function canManageRecipe(
  recipe: Pick<RecipeDetail, "approved"> &
    Partial<Pick<RecipeDetail, "createdById">>,
  user: User | null,
): boolean {
  if (!user) return false;
  return isAdmin(user) || (!recipe.approved && user.id === recipe.createdById);
}

export type PendingApprovalViewer = "owner" | "admin";

export function pendingApprovalViewer(
  recipe: Pick<RecipeDetail, "approved" | "createdById">,
  user: User | null,
): PendingApprovalViewer | null {
  if (!user || recipe.approved) return null;
  if (isAdmin(user)) return "admin";
  return user.id === recipe.createdById ? "owner" : null;
}
