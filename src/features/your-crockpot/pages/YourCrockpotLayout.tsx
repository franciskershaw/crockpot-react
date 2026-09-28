import { Suspense } from "react";
import { RouteFallback } from "@/components/RouteFallback";
import { MenuActionsMenu } from "@/features/menu/components/MenuActionsMenu";
import { useMenu } from "@/features/menu/hooks/useMenu";
import { cn } from "@/lib/utils";
import { Outlet, useLocation } from "react-router-dom";

import { LibraryTabs } from "../components/LibraryTabs";
import { YourCrockpotTabs } from "../components/YourCrockpotTabs";
import { useFavourites } from "../hooks/useFavourites";
import {
  findYourCrockpotTab,
  YOUR_CROCKPOT_TABS,
} from "../utils/yourCrockpotTabs";

function menuSubtitle(recipeCount: number | undefined) {
  if (recipeCount === undefined) return "Your Crockpot";
  if (recipeCount === 0) return "Your Crockpot · nothing on the menu yet";
  return `Your Crockpot · ${recipeCount} ${recipeCount === 1 ? "recipe" : "recipes"}`;
}

function librarySubtitle(favouriteCount: number | undefined) {
  if (favouriteCount === undefined) return "Your Crockpot";
  if (favouriteCount === 0) return "Your Crockpot · no saved recipes yet";
  return `Your Crockpot · ${favouriteCount} ${favouriteCount === 1 ? "favourite" : "favourites"}`;
}

export function YourCrockpotLayout() {
  const { pathname } = useLocation();
  const { data: menu } = useMenu();
  const { data: favourites } = useFavourites();
  const menuCount = menu?.entries.length;
  const favouriteCount = favourites?.pages[0]?.total;
  const tab = findYourCrockpotTab(pathname) ?? YOUR_CROCKPOT_TABS[0];
  const isLibrary = tab.path === "/library";
  const showMenuActions = tab.path === "/menu" && (menuCount ?? 0) > 0;
  const subtitle = isLibrary
    ? librarySubtitle(favouriteCount)
    : menuSubtitle(menuCount);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-6 pt-6 pb-10 lg:h-[calc(100dvh-4rem)] lg:overflow-hidden lg:pb-0">
      <div className="sticky top-16 z-20 -mx-6 -mt-6 shrink-0 bg-background px-6 pt-6 pb-3 lg:static">
        <div
          className={cn(
            "flex flex-wrap items-end justify-between gap-4 border-b border-slider-track pb-5",
            isLibrary && "max-md:border-0 max-md:pb-0",
          )}
        >
          <div className="flex w-full items-start justify-between gap-3 md:w-auto">
            <div>
              <h1 className="mb-1.25 font-display text-[46px] leading-none font-medium tracking-[-0.015em] text-foreground">
                {tab.label}
              </h1>
              <p className="text-[15px] text-muted-foreground">{subtitle}</p>
            </div>
            {showMenuActions && (
              <div className="-mr-2 md:hidden">
                <MenuActionsMenu />
              </div>
            )}
          </div>
          <YourCrockpotTabs counts={{ "/menu": menuCount }} />
        </div>
        {isLibrary && (
          <LibraryTabs counts={{ "/library/favourites": favouriteCount }} />
        )}
      </div>
      <div className="min-h-0 flex-1">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
