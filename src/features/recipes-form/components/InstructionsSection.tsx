import { useState } from "react";
import { InstructionSteps } from "@/features/recipes/components/InstructionSteps";
import { FIELD_CLASSES } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { Eye, Pencil } from "lucide-react";

import { parseSteps } from "../utils/parseSteps";
import { FormSection } from "./FormSection";

const PLACEHOLDER = `One step per line, e.g.
Toss the beef in flour and season well.
Brown it in batches, then transfer to the slow cooker.`;

export function InstructionsSection() {
  const [text, setText] = useState("");
  const [previewing, setPreviewing] = useState(
    () => parseSteps(text).length > 0,
  );
  const steps = parseSteps(text);

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
        <InstructionSteps steps={steps} />
      ) : (
        <textarea
          aria-label="Instructions, one step per line"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={PLACEHOLDER}
          rows={8}
          className={cn(
            FIELD_CLASSES,
            "block w-full resize-y px-4 py-3.5 text-[15px] leading-7 outline-none placeholder:text-placeholder",
          )}
        />
      )}
      <p className="mt-3 text-[13px] text-placeholder">
        One line, one step — switch to Preview any time to sanity-check before
        you publish.
      </p>
    </FormSection>
  );
}
