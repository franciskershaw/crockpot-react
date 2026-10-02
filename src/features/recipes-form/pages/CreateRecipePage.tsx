import { useAuth } from "@/features/auth/components/AuthContext";
import { toast } from "sonner";

import { RecipeForm } from "../components/RecipeForm";
import { useCreateRecipe } from "../hooks/useCreateRecipe";
import { defaultRecipeFormValues } from "../utils/recipeFormSchema";
import { toRequest } from "../utils/toRequest";

export function CreateRecipePage() {
  const { user } = useAuth();
  const createRecipe = useCreateRecipe();

  return (
    <RecipeForm
      title="Add a recipe"
      subtitle="Fill it in below — you'll be done in under a minute."
      backTo="/recipes"
      defaultValues={defaultRecipeFormValues}
      submitLabel="Publish recipe"
      pendingLabel="Publishing…"
      isPending={createRecipe.isPending}
      error={createRecipe.error}
      onSubmit={(values, done) =>
        createRecipe.mutate(toRequest(values), {
          onSuccess: (recipe) => {
            if (user?.role !== "ADMIN") {
              toast.success(
                "Submitted — only you can see it until it's approved.",
              );
            }
            done(recipe.id);
          },
        })
      }
    />
  );
}
