import { useCallback, useState } from "react";

// Start fetching about a viewport before the end so the next page is usually
// there by the time the user arrives.
const PREFETCH_MARGIN = "100% 0px";

export function useSentinelInView() {
  const [inView, setInView] = useState(false);

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => setInView(entries[entries.length - 1].isIntersecting),
      { rootMargin: PREFETCH_MARGIN },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      setInView(false);
    };
  }, []);

  return { sentinelRef, inView };
}
