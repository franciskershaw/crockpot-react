import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// No `/recipes/new` route yet — renders as an inert placeholder everywhere it appears.
export function AddRecipeLink({
  className = "",
  children = "Add a recipe",
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      aria-disabled="true"
      title="Coming soon"
      className={cn("cursor-not-allowed text-muted-foreground/50", className)}
    >
      {children}
    </span>
  );
}
