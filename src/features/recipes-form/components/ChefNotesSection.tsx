import { useState } from "react";
import { FIELD_CLASSES } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

import { parseNotes } from "../utils/parseNotes";
import { FormSection } from "./FormSection";

const MAX_NOTES = 10;

function notesHint(count: number): string {
  if (count === 0) return `One line, one note — up to ${MAX_NOTES}.`;
  if (count <= MAX_NOTES) return `${count} of ${MAX_NOTES} notes`;
  return `${count} notes — remove ${count - MAX_NOTES} to publish`;
}

const PLACEHOLDER = `One note per line, e.g.
Even better the next day.
Freezes well for up to 3 months.`;

// Module-level so the ref callback is stable and focuses only on mount.
const focusOnMount = (textarea: HTMLTextAreaElement | null) =>
  textarea?.focus();

export function ChefNotesSection() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 cursor-pointer items-center gap-2 self-start rounded-lg border-[1.5px] border-foreground bg-card px-4 text-[15px] font-bold"
      >
        <Plus size={16} strokeWidth={2.2} />
        Add chef's notes (optional)
      </button>
    );
  }

  const noteCount = parseNotes(notes).length;

  const remove = () => {
    setNotes("");
    setOpen(false);
  };

  return (
    <FormSection
      title="Chef's notes"
      action={
        <button
          type="button"
          aria-label="Remove chef's notes"
          onClick={remove}
          className="flex size-8 cursor-pointer items-center justify-center rounded-full text-icon-muted hover:text-ink-body"
        >
          <Trash2 size={17} strokeWidth={2} />
        </button>
      }
    >
      <textarea
        ref={focusOnMount}
        aria-label="Chef's notes, one per line"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
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
    </FormSection>
  );
}
