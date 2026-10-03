import { MobileRecipeRowSkeleton } from "@/features/recipes/components/MobileRecipeRowSkeleton";
import { RecipeCardSkeleton } from "@/features/recipes/components/RecipeCardSkeleton";
import {
  RECIPE_GRID_CLASSES,
  RECIPE_LIST_CLASSES,
} from "@/features/recipes/utils/styles";
import { DELAYED_FADE_IN_CLASSES } from "@/lib/styles";
import { cn } from "@/lib/utils";

const CARD_COUNT = 6;
const ROW_COUNT = 5;

export function MenuSkeleton() {
  return (
    <div className={cn("@container", DELAYED_FADE_IN_CLASSES)}>
      <output aria-live="polite" className="sr-only">
        Loading your menu…
      </output>
      <div className={RECIPE_LIST_CLASSES}>
        {Array.from({ length: ROW_COUNT }).map((_, i) => (
          <MobileRecipeRowSkeleton key={i} />
        ))}
      </div>
      <div className={RECIPE_GRID_CLASSES}>
        {Array.from({ length: CARD_COUNT }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
