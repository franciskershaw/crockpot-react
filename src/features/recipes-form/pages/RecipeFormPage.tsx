import { FormSection } from "../components/FormSection";
import { InstructionsSection } from "../components/InstructionsSection";
import { RecipeDetailsSection } from "../components/RecipeDetailsSection";
import { RecipeFormFooter } from "../components/RecipeFormFooter";
import { RecipeFormMobileHeader } from "../components/RecipeFormMobileHeader";

export function RecipeFormPage() {
  return (
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
          <div className="lg:sticky lg:top-22">
            <RecipeDetailsSection />
          </div>
          <div className="flex flex-col gap-3 lg:gap-6">
            <FormSection title="Ingredients*" />
            <InstructionsSection />
          </div>
        </div>
      </div>

      <RecipeFormFooter
        status="Name, categories, ingredients and one step needed to publish"
        submitLabel="Publish recipe"
      />
    </div>
  );
}
