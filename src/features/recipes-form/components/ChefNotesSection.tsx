import { RECIPE_LIMITS } from "@/features/recipes/utils/recipeLimits";
import { useController } from "react-hook-form";

import type { RecipeFormValues } from "../data/types";
import { parseNotes } from "../utils/parseNotes";
import { TEXTAREA_CLASSES } from "../utils/styles";
import { CountHint } from "./CountHint";
import { OptionalSection } from "./OptionalSection";

const PLACEHOLDER = `One note per line, e.g.
Even better the next day.
Freezes well for up to 3 months.`;

export function ChefNotesSection() {
  const {
    field: { value, onChange, onBlur, ref },
  } = useController<RecipeFormValues, "notes">({ name: "notes" });
  const noteCount = parseNotes(value).length;

  return (
    <OptionalSection
      addLabel="Add chef's notes (optional)"
      title="Chef's notes"
      removeLabel="Remove chef's notes"
      initiallyOpen={value !== ""}
      onRemove={() => onChange("")}
    >
      <textarea
        ref={ref}
        aria-label="Chef's notes, one per line"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={PLACEHOLDER}
        rows={4}
        className={TEXTAREA_CLASSES}
      />
      <CountHint
        count={noteCount}
        max={RECIPE_LIMITS.notes.max}
        noun="notes"
        emptyHint={`One line, one note — up to ${RECIPE_LIMITS.notes.max}.`}
      />
    </OptionalSection>
  );
}
