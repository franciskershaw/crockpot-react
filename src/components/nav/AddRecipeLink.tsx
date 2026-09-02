import type { ReactNode } from "react";

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
      className={`cursor-not-allowed text-muted-foreground/50 ${className}`}
    >
      {children}
    </span>
  );
}
