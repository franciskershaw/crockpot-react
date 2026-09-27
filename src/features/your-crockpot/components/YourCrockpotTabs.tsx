import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";

import { YOUR_CROCKPOT_TABS } from "../utils/yourCrockpotTabs";

export function YourCrockpotTabs() {
  return (
    <nav
      aria-label="Your Crockpot"
      className="flex gap-0.75 rounded-full border border-border bg-chip p-1"
    >
      {YOUR_CROCKPOT_TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            cn(
              "rounded-full px-5.5 py-2.25 text-[15px] leading-[1.15] transition-colors",
              isActive
                ? "bg-card font-bold text-foreground shadow-[0_1px_2px_rgba(60,48,30,0.1)]"
                : "font-medium text-muted-foreground hover:text-foreground",
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
