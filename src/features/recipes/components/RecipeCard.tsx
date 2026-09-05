import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/components/AuthContext";
import { Clock, Heart, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { useToggleFavourite } from "../hooks/useToggleFavourite";
import type { RecipeCard as RecipeCardData } from "../types";

export function RecipeCard({ recipe }: { recipe: RecipeCardData }) {
  const { isAuthenticated } = useAuth();
  const toggleFavourite = useToggleFavourite();

  const handleFavouriteClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavourite.mutate({
      recipeId: recipe.id,
      wasFavourite: recipe.isFavourite,
    });
  };

  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-[0_2px_0_var(--color-card-shadow)] focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <div className="relative h-45 w-full bg-muted">
        {recipe.imageUrl && (
          <img
            src={recipe.imageUrl}
            alt=""
            className="block size-full object-cover"
          />
        )}

        {isAuthenticated && (
          <button
            type="button"
            aria-label={
              recipe.isFavourite
                ? "Remove from favourites"
                : "Add to favourites"
            }
            onClick={handleFavouriteClick}
            className="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full border border-border bg-card"
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
        )}
      </div>

      <div className="flex flex-col gap-2 px-4 pt-3.5 pb-4.5 text-left">
        <h3
          className="truncate font-display text-[21px] leading-[1.2] font-normal text-foreground"
          title={recipe.name}
        >
          {recipe.name}
        </h3>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock size={15} strokeWidth={2} />
            <span>{recipe.timeInMinutes} mins</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={15} strokeWidth={2} />
            <span>Serves {recipe.serves}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {recipe.categories.map((category) => (
            <Badge key={category.id} variant="chip">
              {category.name}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
