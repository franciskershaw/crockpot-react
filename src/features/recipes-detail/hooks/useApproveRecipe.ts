import { approveRecipe } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import type { RecipeDetail } from "@/features/recipes/data/types";
import type { ApiError } from "@/lib/http/client";
import { useApiMutation } from "@/lib/tanstack/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function isRecipeChanged(error: ApiError | null): boolean {
  return error?.status === 409 && error.message === "recipe_changed";
}

// updatedAt goes back exactly as the API sent it: a Date would drop its microseconds and never match.
export function useApproveRecipe(recipeId: string) {
  const queryClient = useQueryClient();

  return useApiMutation<RecipeDetail, string>({
    mutationFn: (updatedAt) => approveRecipe(recipeId, updatedAt),
    isHandledError: isRecipeChanged,
    onSuccess: (detail) => {
      queryClient.setQueryData(recipeKeys.detail(recipeId), detail);
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      toast.success("Approved");
    },
    // Awaited, so Approve stays disabled until the fresh version is on screen.
    onError: (error) =>
      isRecipeChanged(error)
        ? queryClient.invalidateQueries({
            queryKey: recipeKeys.detail(recipeId),
          })
        : undefined,
  });
}
