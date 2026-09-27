import { Suspense } from "react";
import { RouteFallback } from "@/components/RouteFallback";
import { MenuActionsMenu } from "@/features/menu/components/MenuActionsMenu";
import { useMenu } from "@/features/menu/hooks/useMenu";
import { Outlet, useLocation } from "react-router-dom";

import { YourCrockpotTabs } from "../components/YourCrockpotTabs";
import {
  findYourCrockpotTab,
  YOUR_CROCKPOT_TABS,
} from "../utils/yourCrockpotTabs";

function menuSubtitle(recipeCount: number | undefined) {
  if (recipeCount === undefined) return "Your Crockpot";
  if (recipeCount === 0) return "Your Crockpot · nothing on the menu yet";
  return `Your Crockpot · ${recipeCount} ${recipeCount === 1 ? "recipe" : "recipes"}`;
}

export function YourCrockpotLayout() {
  const { pathname } = useLocation();
  const { data: menu } = useMenu();
  const tab = findYourCrockpotTab(pathname) ?? YOUR_CROCKPOT_TABS[0];
  const showMenuActions = tab.to === "/menu" && (menu?.entries.length ?? 0) > 0;
  const subtitle =
    tab.to === "/menu" ? menuSubtitle(menu?.entries.length) : "Your Crockpot";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-6 pt-6 pb-10 lg:h-[calc(100dvh-4rem)] lg:overflow-hidden lg:pb-0">
      <div className="sticky top-16 z-20 -mx-6 -mt-6 shrink-0 bg-background px-6 pt-6 pb-3 lg:static">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slider-track pb-5">
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
          <YourCrockpotTabs />
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
