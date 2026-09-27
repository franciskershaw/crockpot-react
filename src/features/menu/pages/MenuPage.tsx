import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { ShoppingListPanel } from "@/features/shopping-list/components/ShoppingListPanel";

import { EmptyMenuPanel } from "../components/EmptyMenuPanel";
import { MenuFooterPill } from "../components/MenuFooterPill";
import { useMenu } from "../hooks/useMenu";

export function MenuPage() {
  const { data: menu } = useMenu();
  const entries = menu?.entries;

  return (
    <div className="grid grid-cols-1 items-start gap-6.5 lg:h-full lg:grid-cols-[1fr_372px] lg:grid-rows-1 lg:items-stretch">
      <div className="relative min-w-0 lg:h-full">
        <div className="lg:-mx-1 lg:h-full lg:overflow-y-auto lg:px-1 lg:pt-1 lg:pb-28">
          {entries &&
            (entries.length === 0 ? (
              <EmptyMenuPanel />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {entries.map((entry) => (
                  <RecipeCard
                    key={entry.recipeId}
                    recipe={entry.recipe}
                    from="/menu"
                  />
                ))}
              </div>
            ))}
        </div>
        {entries && <MenuFooterPill recipeCount={entries.length} />}
      </div>
      <div className="min-w-0 lg:-mx-1 lg:h-full lg:overflow-y-auto lg:px-1 lg:pt-1 lg:pb-6">
        <ShoppingListPanel />
      </div>
    </div>
  );
}
