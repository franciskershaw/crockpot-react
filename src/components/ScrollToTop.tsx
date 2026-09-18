import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Plain BrowserRouter has no built-in scroll restoration; skips POP (native
// back/forward restoration already works) and hash links (owned by useScrollToHash).
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  const previousPathname = useRef(pathname);

  useLayoutEffect(() => {
    const pathnameChanged = previousPathname.current !== pathname;
    previousPathname.current = pathname;
    if (!pathnameChanged || navigationType === "POP" || hash) return;
    window.scrollTo(0, 0);
  }, [pathname, navigationType, hash]);

  return null;
}
