import { MobileRecipeRowSkeleton } from "@/features/recipes/components/MobileRecipeRowSkeleton";
import { RecipeCardSkeleton } from "@/features/recipes/components/RecipeCardSkeleton";
import { DELAYED_FADE_IN_CLASSES } from "@/lib/styles";

import { FAVOURITES_GRID_CLASSES } from "../utils/styles";

// One page's worth.
const COUNT = 12;

export function FavouritesSkeleton() {
  return (
    <div className={DELAYED_FADE_IN_CLASSES}>
      <output aria-live="polite" className="sr-only">
        Loading your favourites…
      </output>
      <div className="flex flex-col gap-2.5 md:hidden">
        {Array.from({ length: COUNT }).map((_, i) => (
          <MobileRecipeRowSkeleton key={i} />
        ))}
      </div>
      <div className={FAVOURITES_GRID_CLASSES}>
        {Array.from({ length: COUNT }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
