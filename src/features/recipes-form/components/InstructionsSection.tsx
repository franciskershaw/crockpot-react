import { useState } from "react";
import { InstructionSteps } from "@/features/recipes/components/InstructionSteps";
import { FIELD_CLASSES } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { Eye, Pencil } from "lucide-react";
import { useController } from "react-hook-form";

import type { RecipeFormValues } from "../data/types";
import { parseSteps } from "../utils/parseSteps";
import { MAX_STEPS } from "../utils/recipeFormSchema";
import { FieldError } from "./FieldError";
import { FormSection } from "./FormSection";

const PLACEHOLDER = `One step per line, e.g.
Toss the beef in flour and season well.
Brown it in batches, then transfer to the slow cooker.`;

function stepsHint(count: number): string {
  if (count === 0) {
    return "One line, one step — switch to Preview any time to sanity-check before you publish.";
  }
  if (count <= MAX_STEPS) return `${count} of ${MAX_STEPS} steps`;
  return `${count} steps — remove ${count - MAX_STEPS} to publish`;
}

export function InstructionsSection() {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController<RecipeFormValues, "instructions">({
    name: "instructions",
  });
  const [previewing, setPreviewing] = useState(
    () => parseSteps(value).length > 0,
  );
  const steps = parseSteps(value);
  const overLimit = steps.length > MAX_STEPS;

  const toggle = (
    <button
      type="button"
      onClick={() => setPreviewing(!previewing)}
      disabled={!previewing && steps.length === 0}
      className="flex cursor-pointer items-center gap-1.5 text-sm font-bold text-green disabled:cursor-not-allowed disabled:opacity-40"
    >
      {previewing ? (
        <>
          <Pencil size={14} strokeWidth={2.2} />
          Edit
        </>
      ) : (
        <>
          <Eye size={15} strokeWidth={2.2} />
          Preview steps
        </>
      )}
    </button>
  );

  return (
    <FormSection title="Instructions*" action={toggle}>
      {previewing ? (
        <>
          <InstructionSteps steps={steps.slice(0, MAX_STEPS)} />
          {overLimit && (
            <p className="mt-5 text-[13px] font-semibold text-rust-text">
              +{steps.length - MAX_STEPS} more steps — remove them to publish
            </p>
          )}
        </>
      ) : (
        <textarea
          ref={ref}
          aria-label="Instructions, one step per line"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={PLACEHOLDER}
          rows={8}
          className={cn(
            FIELD_CLASSES,
            "block w-full resize-y px-4 py-3.5 text-[15px] leading-7 outline-none placeholder:text-placeholder",
          )}
        />
      )}
      {/* Over the limit, the hint below already says so. */}
      {!overLimit && <FieldError message={error?.message} />}
      <p
        aria-live="polite"
        className={cn(
          "mt-3 text-[13px]",
          overLimit ? "font-semibold text-rust-text" : "text-placeholder",
        )}
      >
        {stepsHint(steps.length)}
      </p>
    </FormSection>
  );
}
