import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/components/AuthContext";
import { ChefHat, Clock, Users } from "lucide-react";

import { useRecipeBackDestination } from "../hooks/useRecipeBackDestination";
import { useRecipePermissions } from "../hooks/useRecipePermissions";
import type { RecipeDetail } from "../types";
import { AddToMenuCTA } from "./add-to-menu/AddToMenuCTA";
import { RecipeBackButton } from "./RecipeBackButton";
import { RecipeDeleteButton } from "./RecipeDeleteButton";
import { RecipeEditButton } from "./RecipeEditButton";
import { RecipeFavouriteButton } from "./RecipeFavouriteButton";

// Same frosted-circle treatment RecipeBackButton already established for
// controls overlaid on the hero image.
const ACTION_BUTTON_CLASSES =
  "border-0 bg-background/90 backdrop-blur-xs shadow-sm hover:bg-background";

export function RecipeHero({ recipe }: { recipe: RecipeDetail }) {
  const { isAuthenticated } = useAuth();
  const permissions = useRecipePermissions(recipe);
  const { to } = useRecipeBackDestination();

  return (
    <div className="relative h-[420px] w-full bg-muted md:h-[480px]">
      {recipe.imageUrl && (
        <img
          src={recipe.imageUrl}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      )}
      {/* Flat wash keeps any uploaded image readable; gradient adds contrast behind the text. */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <RecipeBackButton />

      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-6">
        {recipe.categories.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {recipe.categories.map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className="border-transparent bg-background/90 text-foreground"
              >
                {category.name}
              </Badge>
            ))}
          </div>
        )}

        <h1 className="mb-4 font-display text-4xl leading-[1.1] font-normal text-white md:text-6xl">
          {recipe.name}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 md:justify-start md:gap-8">
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
            <div className="flex items-center gap-1.5">
              <Clock size={16} strokeWidth={2} />
              <span>{recipe.timeInMinutes} mins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={16} strokeWidth={2} />
              <span>Serves {recipe.serves}</span>
            </div>
            {recipe.createdByName && (
              <div className="flex items-center gap-1.5">
                <ChefHat size={16} strokeWidth={2} />
                <span>By {recipe.createdByName}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <RecipeFavouriteButton
                recipe={recipe}
                className={ACTION_BUTTON_CLASSES}
              />
            )}
            {permissions.canManage && (
              <>
                <RecipeEditButton
                  recipeId={recipe.id}
                  className={ACTION_BUTTON_CLASSES}
                />
                <RecipeDeleteButton
                  recipeId={recipe.id}
                  recipeName={recipe.name}
                  to={to}
                  className={ACTION_BUTTON_CLASSES}
                />
              </>
            )}
            <AddToMenuCTA recipe={recipe} variant="desktop" />
          </div>
        </div>
      </div>
    </div>
  );
}
