import { useRecipeCategories } from "@/features/recipes/hooks/useRecipeCategories";
import { RECIPE_LIMITS } from "@/features/recipes/utils/recipeLimits";
import { FIELD_CLASSES } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { Clock, Users } from "lucide-react";
import { useController, useFormContext, useFormState } from "react-hook-form";

import type { RecipeFormValues } from "../data/types";
import { LABEL_CLASSES } from "../utils/styles";
import { CategoryPicker } from "./CategoryPicker";
import { FieldError } from "./FieldError";
import { FormSection } from "./FormSection";
import { NumberStepper } from "./NumberStepper";
import { PhotoField } from "./PhotoField";

const STEPPER_LABEL_CLASSES =
  "mb-2 flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-ink-secondary";

export function RecipeDetailsSection() {
  const { register } = useFormContext<RecipeFormValues>();
  // Registered first: a failed publish focuses the first registered field in error.
  const nameField = register("name");
  const { errors } = useFormState<RecipeFormValues>({
    name: ["name", "categoryIds"],
  });
  const { field: timeInMinutes } = useController<
    RecipeFormValues,
    "timeInMinutes"
  >({ name: "timeInMinutes" });
  const { field: serves } = useController<RecipeFormValues, "serves">({
    name: "serves",
  });
  const { field: categoryIds } = useController<RecipeFormValues, "categoryIds">(
    { name: "categoryIds" },
  );
  const { data: categories } = useRecipeCategories();

  return (
    <FormSection>
      <div className="space-y-5">
        <div>
          <label htmlFor="recipe-name" className={LABEL_CLASSES}>
            Recipe name*
          </label>
          <input
            id="recipe-name"
            {...nameField}
            aria-invalid={errors.name ? true : undefined}
            placeholder="e.g. Slow Cooker Beef Stew"
            className={cn(
              FIELD_CLASSES,
              "h-12 w-full px-4 text-[15px] font-semibold outline-none placeholder:font-normal placeholder:text-placeholder aria-invalid:border-rust-icon",
            )}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <PhotoField />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className={STEPPER_LABEL_CLASSES}>
              <Clock size={14} strokeWidth={2.2} aria-hidden />
              Time (mins)*
            </span>
            <NumberStepper
              label="cooking time"
              value={timeInMinutes.value}
              onChange={timeInMinutes.onChange}
              min={RECIPE_LIMITS.time.min}
              max={RECIPE_LIMITS.time.max}
              step={5}
            />
          </div>
          <div>
            <span className={STEPPER_LABEL_CLASSES}>
              <Users size={14} strokeWidth={2.2} aria-hidden />
              Serves*
            </span>
            <NumberStepper
              label="serves"
              value={serves.value}
              onChange={serves.onChange}
              min={RECIPE_LIMITS.serves.min}
              max={RECIPE_LIMITS.serves.max}
              step={1}
            />
          </div>
        </div>

        <div>
          <span className={LABEL_CLASSES}>
            Categories*{" "}
            <span className="font-normal text-icon-muted">
              {`(pick ${RECIPE_LIMITS.categories.min}–${RECIPE_LIMITS.categories.max})`}
            </span>
          </span>
          <CategoryPicker
            categories={categories ?? []}
            selectedIds={categoryIds.value}
            onChange={categoryIds.onChange}
            triggerRef={categoryIds.ref}
          />
          <FieldError message={errors.categoryIds?.message} />
        </div>
      </div>
    </FormSection>
  );
}
