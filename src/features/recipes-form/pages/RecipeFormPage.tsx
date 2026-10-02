import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { ChefNotesSection } from "../components/ChefNotesSection";
import { IngredientsSection } from "../components/IngredientsSection";
import { InstructionsSection } from "../components/InstructionsSection";
import { RecipeDetailsSection } from "../components/RecipeDetailsSection";
import { RecipeFormFooter } from "../components/RecipeFormFooter";
import { RecipeFormMobileHeader } from "../components/RecipeFormMobileHeader";
import type { RecipeFormValues } from "../data/types";
import {
  defaultRecipeFormValues,
  recipeFormSchema,
} from "../utils/recipeFormSchema";

export function RecipeFormPage() {
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: defaultRecipeFormValues,
  });

  return (
    // No <form>: React bubbles the new-item dialog's submit through its portal, and Enter in any field would publish.
    <FormProvider {...form}>
      <div className="flex flex-1 flex-col">
        <RecipeFormMobileHeader title="Add a recipe" fallbackTo="/recipes" />

        <div className="mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-8 md:px-6 md:pt-10 md:pb-12">
          <header className="mb-8 hidden md:block">
            <h1 className="font-display text-[42px] leading-tight font-medium">
              Add a recipe
            </h1>
            <p className="mt-2 max-w-xl text-ink-body">
              Fill it in below — you'll be done in under a minute.
            </p>
          </header>

          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[380px_1fr] lg:items-start lg:gap-7">
            {/* Below lg the column wrappers dissolve into one stack so notes can sit last. */}
            <div className="contents lg:sticky lg:top-22 lg:flex lg:flex-col lg:gap-4">
              <RecipeDetailsSection />
              <div className="flex flex-col max-lg:order-last">
                <ChefNotesSection />
              </div>
            </div>
            <div className="contents lg:flex lg:flex-col lg:gap-6">
              <IngredientsSection />
              <InstructionsSection />
            </div>
          </div>
        </div>

        <RecipeFormFooter
          status="Name, categories, ingredients and one step needed to publish"
          submitLabel="Publish recipe"
          onSubmit={form.handleSubmit(() => {})}
        />
      </div>
    </FormProvider>
  );
}
