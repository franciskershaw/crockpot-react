import { MobileRecipeRowSkeleton } from "@/features/recipes/components/MobileRecipeRowSkeleton";
import { RecipeCardSkeleton } from "@/features/recipes/components/RecipeCardSkeleton";
import { DELAYED_FADE_IN_CLASSES } from "@/lib/styles";

import { LIBRARY_PAGE_SIZE } from "../utils/libraryPageSize";
import { LIBRARY_GRID_CLASSES } from "../utils/styles";

export function LibraryListSkeleton({ label }: { label: string }) {
  return (
    <div className={DELAYED_FADE_IN_CLASSES}>
      <output aria-live="polite" className="sr-only">
        {label}
      </output>
      <div className="flex flex-col gap-2.5 md:hidden">
        {Array.from({ length: LIBRARY_PAGE_SIZE }).map((_, i) => (
          <MobileRecipeRowSkeleton key={i} />
        ))}
      </div>
      <div className={LIBRARY_GRID_CLASSES}>
        {Array.from({ length: LIBRARY_PAGE_SIZE }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
