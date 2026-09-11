import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/components/AuthContext";
import { Clock, Heart, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { useToggleFavourite } from "../hooks/useToggleFavourite";
import type { RecipeCard as RecipeCardData } from "../types";
import { AddToMenuButton } from "./add-to-menu/AddToMenuButton";

// One selected category trivially scores 1.0 for every recipe with that
// tag; a single ingredient doesn't, since it's scored against the recipe's own count.
export function visibleMatchTier(
  tier: RecipeCardData["tier"],
  selectedIngredientCount: number,
  selectedCategoryCount: number,
): RecipeCardData["tier"] {
  if (tier === null) return null;
  if (selectedIngredientCount === 0 && selectedCategoryCount === 1) {
    return null;
  }
  return tier;
}

const TIER_LABEL = {
  best: "Best Match",
  good: "Good Match",
} as const;

const TIER_BADGE_CLASSES = {
  best: "bg-accent-gold text-foreground",
  good: "bg-success text-success-foreground",
} as const;

export function RecipeCard({
  recipe,
  from,
  priority = false,
  selectedCategoryCount = 0,
  selectedIngredientCount = 0,
}: {
  recipe: RecipeCardData;
  from: string;
  priority?: boolean;
  selectedCategoryCount?: number;
  selectedIngredientCount?: number;
}) {
  const { isAuthenticated } = useAuth();
  const toggleFavourite = useToggleFavourite();
  const matchTier = visibleMatchTier(
    recipe.tier,
    selectedIngredientCount,
    selectedCategoryCount,
  );

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
      to={`/recipes/${recipe.id}?${new URLSearchParams({ from }).toString()}`}
      className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-[0_2px_0_var(--color-card-shadow)] focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <div className="relative h-45 w-full bg-muted">
        {recipe.imageUrl && (
          <img
            src={recipe.imageUrl}
            alt=""
            loading={priority ? "eager" : "lazy"}
            className="block size-full object-cover"
          />
        )}

        {isAuthenticated && (
          <>
            <div className="absolute left-2.5 top-2.5">
              <AddToMenuButton recipe={recipe} />
            </div>

            <button
              type="button"
              aria-label={
                recipe.isFavourite
                  ? "Remove from favourites"
                  : "Add to favourites"
              }
              onClick={handleFavouriteClick}
              className="absolute right-2.5 top-2.5 flex size-8 cursor-pointer items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-accent"
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
          </>
        )}

        {matchTier && (
          <div className="absolute right-2.5 bottom-2.5">
            <Badge
              variant="outline"
              className={`gap-1 border-transparent ${TIER_BADGE_CLASSES[matchTier]}`}
            >
              <Star size={12} strokeWidth={2} className="fill-current" />
              {TIER_LABEL[matchTier]}
            </Badge>
          </div>
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
        {(recipe.matchedIngredientCount > 0 ||
          recipe.matchedCategoryCount > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.matchedIngredientCount > 0 && (
              <Badge
                variant="outline"
                className="border-ingredient-chip-border bg-ingredient-chip-bg text-ingredient-chip-text"
              >
                {`${recipe.matchedIngredientCount} of ${recipe.totalIngredientCount} ingredient${
                  recipe.totalIngredientCount === 1 ? "" : "s"
                } matched`}
              </Badge>
            )}
            {recipe.matchedCategoryCount > 0 && (
              <Badge
                variant="outline"
                className="border-category-chip-border bg-category-chip-bg text-category-chip-text"
              >
                {`${recipe.matchedCategoryCount} categor${
                  recipe.matchedCategoryCount === 1 ? "y" : "ies"
                } matched`}
              </Badge>
            )}
          </div>
        )}
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
