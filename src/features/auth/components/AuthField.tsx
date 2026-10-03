import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/ui/input";

import { AUTH_INPUT } from "../utils/styles";

export function AuthField({
  id,
  label,
  action,
  ...inputProps
}: ComponentProps<"input"> & {
  id: string;
  label: string;
  action?: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="text-[13px] font-bold text-ink-secondary"
        >
          {label}
        </label>
        {action}
      </div>
      <Input id={id} className={AUTH_INPUT} {...inputProps} />
    </div>
  );
}
