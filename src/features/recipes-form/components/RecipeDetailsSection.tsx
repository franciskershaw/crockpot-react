import { useState } from "react";
import { FIELD_CLASSES } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { Clock, Users } from "lucide-react";

import { FormSection } from "./FormSection";
import { NumberStepper } from "./NumberStepper";

const LABEL_CLASSES = "mb-2 block text-sm font-semibold text-ink-secondary";
const STEPPER_LABEL_CLASSES =
  "mb-2 flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-ink-secondary";

export function RecipeDetailsSection() {
  const [name, setName] = useState("");
  const [timeInMinutes, setTimeInMinutes] = useState(30);
  const [serves, setServes] = useState(4);

  return (
    <FormSection>
      <div className="space-y-5">
        <div>
          <label htmlFor="recipe-name" className={LABEL_CLASSES}>
            Recipe name*
          </label>
          <input
            id="recipe-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Slow Cooker Beef Stew"
            className={cn(
              FIELD_CLASSES,
              "h-12 w-full px-4 text-[15px] font-semibold outline-none placeholder:font-normal placeholder:text-placeholder",
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className={STEPPER_LABEL_CLASSES}>
              <Clock size={14} strokeWidth={2.2} aria-hidden />
              Time (mins)*
            </span>
            <NumberStepper
              label="cooking time"
              value={timeInMinutes}
              onChange={setTimeInMinutes}
              min={1}
              max={1440}
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
              value={serves}
              onChange={setServes}
              min={1}
              max={50}
              step={1}
            />
          </div>
        </div>
      </div>
    </FormSection>
  );
}
