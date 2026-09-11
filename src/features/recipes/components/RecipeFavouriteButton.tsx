import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

import { useToggleFavourite } from "../hooks/useToggleFavourite";
import type { RecipeCard as RecipeCardData } from "../types";

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
      className={cn(
        "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-accent",
        className,
      )}
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
