import { useSearchParams } from "react-router-dom";

interface BackDestination {
  to: string;
  label: string;
}

const DEFAULT_TO = "/recipes";

// Allowlist, not a pattern: a from whose path isn't listed here falls back to /recipes, so it can't become an off-site href.
const BACK_LABELS: Record<string, string> = {
  [DEFAULT_TO]: "Back to recipes",
  "/menu": "Back to menu",
  "/library/favourites": "Back to favourites",
  "/library/my-recipes": "Back to my recipes",
  "/library/pending": "Back to pending",
};

export function resolveBackDestination(
  from: string | null | undefined,
): BackDestination {
  const to = from?.trim() ?? "";
  const path = to.split("?", 1)[0];
  if (!Object.hasOwn(BACK_LABELS, path)) {
    return { to: DEFAULT_TO, label: BACK_LABELS[DEFAULT_TO] };
  }
  return { to, label: BACK_LABELS[path] };
}

export function useRecipeBackDestination(): BackDestination {
  const [searchParams] = useSearchParams();
  return resolveBackDestination(searchParams.get("from"));
}
