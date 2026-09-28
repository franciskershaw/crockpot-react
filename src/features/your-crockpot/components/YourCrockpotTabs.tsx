import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

import {
  findYourCrockpotTab,
  YOUR_CROCKPOT_TABS,
} from "../utils/yourCrockpotTabs";

export function YourCrockpotTabs({
  counts,
}: {
  counts: Partial<Record<string, number>>;
}) {
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const current = findYourCrockpotTab(pathname);

  // On mobile the strip scrolls sideways; keep the current tab in view.
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active) return;
    nav.scrollLeft =
      active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
  }, [pathname]);

  return (
    <nav
      ref={navRef}
      aria-label="Your Crockpot"
      className="flex w-full max-w-full gap-0.75 overflow-x-auto rounded-full border border-border bg-chip p-1 [scrollbar-width:none] md:w-auto md:overflow-visible [&::-webkit-scrollbar]:hidden"
    >
      {YOUR_CROCKPOT_TABS.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          aria-current={tab === current ? "page" : undefined}
          className={cn(
            "flex-1 shrink-0 rounded-full px-5.5 py-2.25 text-center text-[15px] leading-[1.15] whitespace-nowrap transition-[color] md:flex-none",
            tab === current
              ? "bg-card font-bold text-foreground shadow-tab"
              : "font-medium text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
          {counts[tab.to] !== undefined && (
            <>
              {" "}
              <span className="font-normal text-muted-foreground">
                {counts[tab.to]}
              </span>
            </>
          )}
        </Link>
      ))}
    </nav>
  );
}
