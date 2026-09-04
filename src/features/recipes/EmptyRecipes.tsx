import { AddRecipeLink } from "@/components/nav/AddRecipeLink";
import { Button } from "@/components/ui/button";
import { ChefHat, Search } from "lucide-react";

export function EmptyRecipes({
  activeFilterCount,
  onClearFilters,
}: {
  activeFilterCount: number;
  onClearFilters: () => void;
}) {
  if (activeFilterCount > 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <Search className="size-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl">No results</h2>
          <p className="max-w-md text-muted-foreground">
            We couldn&apos;t find any recipes matching your current filters. Try
            adjusting or clearing them to see more options.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {activeFilterCount} active filter
          {activeFilterCount !== 1 ? "s" : ""}
        </p>
        <div className="flex flex-col items-center gap-3">
          <Button variant="outline" onClick={onClearFilters}>
            Clear all filters
          </Button>
          <AddRecipeLink />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <ChefHat className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="font-display text-2xl">No recipes yet</h2>
        <p className="max-w-md text-muted-foreground">
          It looks like there are no recipes in the collection yet. Check back
          soon.
        </p>
      </div>
      <AddRecipeLink />
    </div>
  );
}
