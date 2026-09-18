import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/components/AuthContext";
import { cn } from "@/lib/utils";
import { ChefHat, Clock, Users } from "lucide-react";

import { useRecipeBackDestination } from "../hooks/useRecipeBackDestination";
import { useRecipePermissions } from "../hooks/useRecipePermissions";
import type { StickyHeroTrigger } from "../hooks/useStickyHeroTrigger";
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

export function RecipeHero({
  recipe,
  sentinelRef,
  isStuck,
}: {
  recipe: RecipeDetail;
} & StickyHeroTrigger) {
  const { isAuthenticated } = useAuth();
  const permissions = useRecipePermissions(recipe);
  const { to } = useRecipeBackDestination();

  const actions = (
    <>
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
      {isAuthenticated && <AddToMenuCTA recipe={recipe} variant="desktop" />}
    </>
  );

  return (
    <>
      <div className="relative h-105 w-full bg-muted md:h-120">
        {recipe.imageUrl && (
          <img
            src={recipe.imageUrl}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        )}
        {/* Flat wash keeps any uploaded image readable; gradient adds contrast behind the text. */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

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

          <div className="flex flex-wrap items-center gap-4 md:gap-8">
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

            {/* Invisible on mobile: reserves this row's space (height + wrap) so title/categories never shift; the real mobile copy is the sticky row below. */}
            <div className="invisible flex items-center gap-2 md:visible">
              {actions}
            </div>
          </div>
        </div>

        {/* Marks the row's natural top; only feeds the background-swap cosmetic below, not the row's position. */}
        <div ref={sentinelRef} className="absolute inset-x-0 bottom-14 h-px" />
      </div>

      {/* -mt-14 pulls this up onto the image, exactly over the invisible row above; mb-14 gives back the same space so later content (tabs) isn't dragged up with it — real `sticky`, so it pins natively with no JS involved. */}
      <div className="sticky top-19 z-30 -mt-14 mb-14 md:hidden ">
        {/* A small amount of breathing room around the buttons, not a cover for the whole handoff zone; translucent + blurred so anything behind reads as a soft smudge, not sharp detail. Always rendered; opacity/transition fades it in only once actually stuck. */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 -top-3 -bottom-3 -z-10 bg-black/70 transition-opacity duration-300 border",
            isStuck ? "opacity-100" : "opacity-0",
          )}
        />
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-2">
          {actions}
        </div>
      </div>
    </>
  );
}
