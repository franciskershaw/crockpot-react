import { MobileRecipeRowSkeleton } from "@/features/recipes/components/MobileRecipeRowSkeleton";
import { RecipeCardSkeleton } from "@/features/recipes/components/RecipeCardSkeleton";
import {
  RECIPE_GRID_CLASSES,
  RECIPE_LIST_CLASSES,
} from "@/features/recipes/utils/styles";
import { DELAYED_FADE_IN_CLASSES } from "@/lib/styles";
import { cn } from "@/lib/utils";

import { LIBRARY_PAGE_SIZE } from "../utils/libraryPageSize";

export function LibraryListSkeleton({ label }: { label: string }) {
  return (
    <div className={cn("@container", DELAYED_FADE_IN_CLASSES)}>
      <output aria-live="polite" className="sr-only">
        {label}
      </output>
      <div className={RECIPE_LIST_CLASSES}>
        {Array.from({ length: LIBRARY_PAGE_SIZE }).map((_, i) => (
          <MobileRecipeRowSkeleton key={i} />
        ))}
      </div>
      <div className={RECIPE_GRID_CLASSES}>
        {Array.from({ length: LIBRARY_PAGE_SIZE }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
