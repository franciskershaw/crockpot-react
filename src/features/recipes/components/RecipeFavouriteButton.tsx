import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

import type { RecipeCard as RecipeCardData } from "../data/types";
import { useToggleFavourite } from "../hooks/useToggleFavourite";
import { ICON_BUTTON_CLASSES } from "../utils/styles";

export function RecipeFavouriteButton({
  recipe,
  className,
  onClick,
}: {
  recipe: Pick<RecipeCardData, "id" | "isFavourite">;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
}) {
  const toggleFavourite = useToggleFavourite();

  const handleClick = (event: React.MouseEvent) => {
    onClick?.(event);
    toggleFavourite.mutate({
      recipeId: recipe.id,
      wasFavourite: recipe.isFavourite,
    });
  };

  return (
    <button
      type="button"
      aria-label={
        recipe.isFavourite ? "Remove from favourites" : "Add to favourites"
      }
      onClick={handleClick}
      className={cn(ICON_BUTTON_CLASSES, className)}
    >
      <Heart
        size={15}
        strokeWidth={2}
        className={
          recipe.isFavourite
            ? "fill-accent-rust text-accent-rust"
            : "text-ink-secondary"
        }
      />
    </button>
  );
}
