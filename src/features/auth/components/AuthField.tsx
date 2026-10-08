import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { AUTH_INPUT } from "../utils/styles";

export function AuthField({
  id,
  label,
  action,
  error,
  inputClassName,
  ...inputProps
}: ComponentProps<"input"> & {
  id: string;
  label: string;
  action?: ReactNode;
  error?: string;
  inputClassName?: string;
}) {
  const errorId = `${id}-error`;
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
      <Input
        id={id}
        className={cn(AUTH_INPUT, inputClassName)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p
          id={errorId}
          className="mt-1.5 text-[13px] font-semibold text-field-error"
        >
          {error}
        </p>
      )}
    </div>
  );
}
