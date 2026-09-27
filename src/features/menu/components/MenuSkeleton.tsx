import { MobileRecipeRowSkeleton } from "@/features/recipes/components/MobileRecipeRowSkeleton";
import { RecipeCardSkeleton } from "@/features/recipes/components/RecipeCardSkeleton";
import { DELAYED_FADE_IN_CLASSES } from "@/lib/styles";

const CARD_COUNT = 6;
const ROW_COUNT = 5;

export function MenuSkeleton() {
  return (
    <div className={DELAYED_FADE_IN_CLASSES}>
      <output aria-live="polite" className="sr-only">
        Loading your menu…
      </output>
      <div className="flex flex-col gap-2.5 md:hidden">
        {Array.from({ length: ROW_COUNT }).map((_, i) => (
          <MobileRecipeRowSkeleton key={i} />
        ))}
      </div>
      <div className="hidden grid-cols-2 gap-4 md:grid xl:grid-cols-3">
        {Array.from({ length: CARD_COUNT }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
