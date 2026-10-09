import { useState } from "react";
import { InstructionSteps } from "@/features/recipes/components/InstructionSteps";
import { RECIPE_LIMITS } from "@/features/recipes/utils/recipeLimits";
import { Eye, Pencil } from "lucide-react";
import { useController } from "react-hook-form";

import type { RecipeFormValues } from "../data/types";
import { parseSteps } from "../utils/parseSteps";
import { TEXTAREA_CLASSES } from "../utils/styles";
import { CountHint } from "./CountHint";
import { FieldError } from "./FieldError";
import { FormSection } from "./FormSection";

const PLACEHOLDER = `One step per line, e.g.
Toss the beef in flour and season well.
Brown it in batches, then transfer to the slow cooker.`;

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
  const overLimit = steps.length > RECIPE_LIMITS.steps.max;

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
          <InstructionSteps steps={steps.slice(0, RECIPE_LIMITS.steps.max)} />
          {overLimit && (
            <p className="mt-5 text-[13px] font-semibold text-rust-text">
              +{steps.length - RECIPE_LIMITS.steps.max} more steps — remove them
              to publish
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
          className={TEXTAREA_CLASSES}
        />
      )}
      {/* Over the limit, the hint below already says so. */}
      {!overLimit && <FieldError message={error?.message} />}
      <CountHint
        count={steps.length}
        max={RECIPE_LIMITS.steps.max}
        noun="steps"
        emptyHint="One line, one step — switch to Preview any time to sanity-check before you publish."
      />
    </FormSection>
  );
}
