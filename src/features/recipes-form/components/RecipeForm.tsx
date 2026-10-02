import type { ApiError } from "@/lib/http/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import type { RecipeFormValues } from "../data/types";
import { recipeFormSchema } from "../utils/recipeFormSchema";
import { ChefNotesSection } from "./ChefNotesSection";
import { DescriptionSection } from "./DescriptionSection";
import { IngredientsSection } from "./IngredientsSection";
import { InstructionsSection } from "./InstructionsSection";
import { PublishStatus } from "./PublishStatus";
import { RecipeDetailsSection } from "./RecipeDetailsSection";
import { RecipeFormFooter } from "./RecipeFormFooter";
import { RecipeFormMobileHeader } from "./RecipeFormMobileHeader";

// Other failures are toasted by useApiMutation.
function footerError(error: ApiError | null): string | null {
  if (error?.status === 409) {
    return "You've hit your recipe limit, so this can't be published yet.";
  }
  if (error?.status === 400) {
    return "The server couldn't accept this recipe — check it over and try again.";
  }
  return null;
}

export function RecipeForm({
  title,
  subtitle,
  backTo,
  defaultValues,
  submitLabel,
  pendingLabel,
  footerNote,
  isPending,
  error,
  onSubmit,
}: {
  title: string;
  subtitle?: string;
  backTo: string;
  defaultValues: RecipeFormValues;
  submitLabel: string;
  pendingLabel: string;
  footerNote?: string;
  isPending: boolean;
  error: ApiError | null;
  onSubmit: (values: RecipeFormValues) => void;
}) {
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues,
  });
  const errorMessage = footerError(error);

  return (
    // No <form>: React bubbles the new-item dialog's submit through its portal, and Enter in any field would publish.
    <FormProvider {...form}>
      <div className="flex flex-1 flex-col">
        <RecipeFormMobileHeader title={title} fallbackTo={backTo} />

        <div className="mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-8 md:px-6 md:pt-10 md:pb-12">
          <header className="mb-8 hidden md:block">
            <h1 className="font-display text-[42px] leading-tight font-medium">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 max-w-xl text-ink-body">{subtitle}</p>
            )}
          </header>

          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[380px_1fr] lg:items-start lg:gap-7">
            {/* Below lg the column wrappers dissolve into one stack so notes can sit last. */}
            <div className="contents lg:sticky lg:top-22 lg:flex lg:flex-col lg:gap-4">
              <RecipeDetailsSection />
              <div className="flex flex-col">
                <DescriptionSection />
              </div>
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
          status={
            errorMessage ? (
              <p className="text-[13px] font-semibold text-rust-text">
                {errorMessage}
              </p>
            ) : (
              <div className="space-y-1">
                <PublishStatus />
                {footerNote && (
                  <p className="text-[13px] text-muted-foreground">
                    {footerNote}
                  </p>
                )}
              </div>
            )
          }
          submitLabel={submitLabel}
          pendingLabel={pendingLabel}
          isPending={isPending}
          onSubmit={form.handleSubmit(onSubmit)}
        />
      </div>
    </FormProvider>
  );
}
