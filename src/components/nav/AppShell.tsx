import { Suspense } from "react";
import { RouteFallback } from "@/components/feedback/RouteFallback";
import { MobileTabBar } from "@/components/nav/MobileTabBar";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { useMenu } from "@/features/menu/hooks/useMenu";
import { isRecipeFormPath } from "@/features/recipes-form/utils/recipeFormPaths";
import { cn } from "@/lib/utils";
import { Outlet, useLocation } from "react-router-dom";

// Mounted once for every route; SiteHeader/MobileTabBar branch on auth state
// internally so there's one nav, not a separate one per auth state.
export function AppShell() {
  // Warms the menu cache ahead of any page that needs it, so per-card menu state doesn't flash in after first paint.
  useMenu();
  // The recipe form brings its own mobile header and sticky footer.
  const onRecipeForm = isRecipeFormPath(useLocation().pathname);

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col",
        !onRecipeForm && "pb-16 md:pb-0",
      )}
    >
      <SiteHeader className={onRecipeForm ? "max-md:hidden" : undefined} />
      <main className="flex flex-1 flex-col">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      {!onRecipeForm && <MobileTabBar />}
    </div>
  );
}
