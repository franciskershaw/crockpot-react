import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import type { RecipeFormValues } from "../data/types";
import { publishStatus } from "../utils/publishStatus";

export function PublishStatus() {
  const { control } = useFormContext<RecipeFormValues>();
  const status = useWatch({ control, compute: publishStatus });

  return (
    <p
      aria-live="polite"
      className={cn(
        "flex items-center gap-1.5 text-[13px] font-semibold",
        status.complete ? "text-green" : "text-muted-foreground",
      )}
    >
      {status.complete && <Check size={14} strokeWidth={2.4} aria-hidden />}
      {status.message}
    </p>
  );
}
