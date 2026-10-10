import { StatePanel } from "@/components/feedback/StatePanel";
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
      <StatePanel
        icon={Search}
        heading="No results"
        description="No recipes match these filters. Try changing or clearing some."
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
              <Button asChild>
                <AddRecipeLink />
              </Button>
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
      description="There aren't any recipes yet. Check back soon."
      actions={
        <Button asChild>
          <AddRecipeLink />
        </Button>
      }
    />
  );
}
