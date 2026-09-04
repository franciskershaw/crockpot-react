import { RecipeGrid } from "./RecipeGrid";
import type { RecipeListParams } from "./types";

// Search/filter panel not built yet — params, activeFilterCount, and
// onClearFilters will come from useSearchParams and the filter UI.
const NO_FILTERS: RecipeListParams = {};

export function BrowseRecipesPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <h1 className="mb-6 font-display text-4xl">Browse Recipes</h1>
      <RecipeGrid
        params={NO_FILTERS}
        activeFilterCount={0}
        onClearFilters={() => {}}
      />
    </div>
  );
}
