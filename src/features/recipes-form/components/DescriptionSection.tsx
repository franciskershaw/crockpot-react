import { FIELD_CLASSES } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { useController } from "react-hook-form";

import type { RecipeFormValues } from "../data/types";
import { FieldError } from "./FieldError";
import { OptionalSection } from "./OptionalSection";

export function DescriptionSection() {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController<RecipeFormValues, "description">({ name: "description" });

  return (
    <OptionalSection
      addLabel="Add a description (optional)"
      title="Description"
      removeLabel="Remove description"
      initiallyOpen={value !== ""}
      onRemove={() => onChange("")}
    >
      <textarea
        ref={ref}
        aria-label="Description"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder="A line or two to introduce the recipe, e.g. A freezer-stash regular in our house."
        rows={3}
        className={cn(
          FIELD_CLASSES,
          "block w-full resize-y px-4 py-3.5 text-[15px] leading-7 outline-none placeholder:text-placeholder",
        )}
      />
      <FieldError message={error?.message} />
      <p className="mt-3 text-[13px] text-placeholder">
        Shown under the title on your recipe page.
      </p>
    </OptionalSection>
  );
}
