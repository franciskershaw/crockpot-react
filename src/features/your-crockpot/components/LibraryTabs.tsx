import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";

import { LIBRARY_TABS } from "../utils/yourCrockpotTabs";
import { TabCount } from "./TabCount";

export function LibraryTabs({
  counts,
}: {
  counts: Partial<Record<string, number>>;
}) {
  return (
    <nav
      aria-label="Library"
      className="-mx-6 flex gap-8 border-b border-slider-track px-6 pt-4 md:mx-0 md:border-0 md:px-0 md:pt-6"
    >
      {LIBRARY_TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            cn(
              "-mb-px border-b-[3px] pb-2.5 text-[17px] leading-tight whitespace-nowrap transition-colors md:text-lg",
              isActive
                ? "border-green font-bold text-foreground"
                : "border-transparent font-medium text-muted-foreground hover:text-foreground",
            )
          }
        >
          {tab.label}
          <TabCount count={counts[tab.to]} />
        </NavLink>
      ))}
    </nav>
  );
}
