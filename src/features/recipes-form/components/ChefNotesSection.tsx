import { FIELD_CLASSES } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { useController } from "react-hook-form";

import type { RecipeFormValues } from "../data/types";
import { parseNotes } from "../utils/parseNotes";
import { MAX_NOTES } from "../utils/recipeFormSchema";
import { OptionalSection } from "./OptionalSection";

function notesHint(count: number): string {
  if (count === 0) return `One line, one note — up to ${MAX_NOTES}.`;
  if (count <= MAX_NOTES) return `${count} of ${MAX_NOTES} notes`;
  return `${count} notes — remove ${count - MAX_NOTES} to publish`;
}

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
        className={cn(
          FIELD_CLASSES,
          "block w-full resize-y px-4 py-3.5 text-[15px] leading-7 outline-none placeholder:text-placeholder",
        )}
      />
      <p
        aria-live="polite"
        className={cn(
          "mt-3 text-[13px]",
          noteCount > MAX_NOTES
            ? "font-semibold text-rust-text"
            : "text-placeholder",
        )}
      >
        {notesHint(noteCount)}
      </p>
    </OptionalSection>
  );
}
