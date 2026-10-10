import { useEffect } from "react";
import { ConfirmActionDialog } from "@/components/overlays/ConfirmActionDialog";
import type { ApiError } from "@/lib/http/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import type { RecipeFormValues } from "../data/types";
import { useLeavePrompt } from "../hooks/useLeavePrompt";
import { recipeFormSchema } from "../utils/recipeFormSchema";
import { footerError, photoFieldError } from "../utils/saveErrors";
import { ChefNotesSection } from "./ChefNotesSection";
import { DescriptionSection } from "./DescriptionSection";
import { IngredientsSection } from "./IngredientsSection";
import { InstructionsSection } from "./InstructionsSection";
import { PublishStatus } from "./PublishStatus";
import { RecipeDetailsSection } from "./RecipeDetailsSection";
import { RecipeFormFooter } from "./RecipeFormFooter";
import { RecipeFormMobileHeader } from "./RecipeFormMobileHeader";

export function RecipeForm({
  title,
  subtitle,
  backTo,
  defaultValues,
  submitLabel,
  pendingLabel,
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
  isPending: boolean;
  error: ApiError | null;
  onSubmit: (
    values: RecipeFormValues,
    done: (recipeId: string) => void,
  ) => void;
}) {
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues,
  });
  const image = useWatch({ control: form.control, name: "image" });
  const errorMessage = footerError(error, {
    sentPhoto: image?.kind === "new",
  });
  const navigate = useNavigate();
  const { blocker, allowLeaving } = useLeavePrompt(form.formState.isDirty);

  useEffect(() => {
    const message = photoFieldError(error);
    if (message) form.setError("image", { type: "server", message });
  }, [error, form]);

  const done = (recipeId: string) => {
    allowLeaving();
    navigate(`/recipes/${recipeId}`, { replace: true });
  };

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
              <PublishStatus />
            )
          }
          submitLabel={submitLabel}
          pendingLabel={pendingLabel}
          isPending={isPending}
          onSubmit={form.handleSubmit((values) => onSubmit(values, done))}
        />
        <ConfirmActionDialog
          open={blocker.state === "blocked"}
          onOpenChange={(open) => {
            if (!open) blocker.reset?.();
          }}
          title="Leave without saving?"
          description="You'll lose your changes to this recipe."
          confirmLabel="Leave"
          destructive
          onConfirm={() => blocker.proceed?.()}
        />
      </div>
    </FormProvider>
  );
}
