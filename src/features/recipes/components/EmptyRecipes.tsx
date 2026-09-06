import { AddRecipeLink } from "@/components/nav/AddRecipeLink";
import { StatePanel } from "@/components/StatePanel";
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
      <StatePanel
        icon={Search}
        heading="No results"
        description="We couldn't find any recipes matching your current filters. Try adjusting or clearing them to see more options."
        actions={
          <>
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
          </>
        }
      />
    );
  }

  return (
    <StatePanel
      icon={ChefHat}
      heading="No recipes yet"
      description="It looks like there are no recipes in the collection yet. Check back soon."
      actions={<AddRecipeLink />}
    />
  );
}
