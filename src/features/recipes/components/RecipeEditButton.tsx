import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";

export function RecipeEditButton({
  recipeId,
  className,
}: {
  recipeId: string;
  className?: string;
}) {
  return (
    <Link
      to={`/recipes/${recipeId}/edit`}
      aria-label="Edit recipe"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent",
        className,
      )}
    >
      <Pencil size={15} strokeWidth={2} />
    </Link>
  );
}
