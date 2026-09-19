import { ICON_BUTTON_CLASSES } from "@/features/recipes/utils/styles";
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
      className={cn(ICON_BUTTON_CLASSES, className)}
    >
      <Pencil size={15} strokeWidth={2} />
    </Link>
  );
}
