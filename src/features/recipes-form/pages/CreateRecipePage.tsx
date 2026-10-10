import { PageTitle } from "@/components/meta/PageTitle";
import { useAuth } from "@/features/auth/components/AuthContext";
import { isAdmin } from "@/features/auth/utils/isAdmin";
import { toast } from "sonner";

import { RecipeForm } from "../components/RecipeForm";
import { useCreateRecipe } from "../hooks/useCreateRecipe";
import { defaultRecipeFormValues } from "../utils/recipeFormSchema";
import { toRequest } from "../utils/toRequest";

export function CreateRecipePage() {
  const { user } = useAuth();
  const createRecipe = useCreateRecipe();

  return (
    <>
      <PageTitle>Add a recipe</PageTitle>
      <RecipeForm
        title="Add a recipe"
        subtitle="Fill it in below. It takes about a minute."
        backTo="/recipes"
        defaultValues={defaultRecipeFormValues}
        submitLabel="Publish recipe"
        pendingLabel="Publishing…"
        isPending={createRecipe.isPending}
        error={createRecipe.error}
        onSubmit={(values, done) =>
          createRecipe.mutate(toRequest(values), {
            onSuccess: (recipe) => {
              if (!isAdmin(user)) {
                toast.success(
                  "Recipe submitted. Only you can see it until it's approved.",
                );
              }
              done(recipe.id);
            },
          })
        }
      />
    </>
  );
}
