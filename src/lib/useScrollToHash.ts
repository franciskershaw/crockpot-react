import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Lets a nav link (`Link to="/#pricing"`) work identically whether it's clicked
// from the target page itself or navigated to from elsewhere.
export function useScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);
}
