import { useCallback, useState } from "react";

// Matches SiteHeader's h-16.
export const HEADER_HEIGHT_PX = 64;
// py-3 above the buttons in the fixed action bar (RecipeHero).
export const ACTION_BAND_PADDING_TOP_PX = 12;
// h-8 action row.
export const ACTION_ROW_HEIGHT_PX = 32;
// py-3 below the buttons in the fixed action bar.
export const ACTION_BAND_PADDING_BOTTOM_PX = 12;
// pb-6 (hero) + py-5 top (RecipeContent): the natural row-to-tabs gap the fixed bars must reproduce.
export const NATURAL_ROW_TO_TABS_GAP_PX = 24 + 20;

// Must match RecipeHero's `top-19`; only drives the background-swap cosmetic, not the row's actual (pure CSS sticky) position.
const STICKY_TOP_PX = 76;

export type StickyHeroTrigger = ReturnType<typeof useStickyHeroTrigger>;

export function useStickyHeroTrigger() {
  const [isStuck, setIsStuck] = useState(false);

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { rootMargin: `-${STICKY_TOP_PX}px 0px 0px 0px`, threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { sentinelRef, isStuck };
}
