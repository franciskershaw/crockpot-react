import { useController } from "react-hook-form";

import type { RecipeFormValues } from "../data/types";
import { TEXTAREA_CLASSES } from "../utils/styles";
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
        className={TEXTAREA_CLASSES}
      />
      <FieldError message={error?.message} />
      <p className="mt-3 text-[13px] text-placeholder">
        Shown under the title on your recipe page.
      </p>
    </OptionalSection>
  );
}
