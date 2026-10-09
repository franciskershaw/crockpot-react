import { useSearchParams } from "react-router-dom";

interface BackDestination {
  to: string;
  label: string;
}

const DEFAULT_TO = "/recipes";

// An unrecognized from is still trusted for navigation, just falls back to the generic label.
const BACK_LABELS: Record<string, string> = {
  [DEFAULT_TO]: "Back to recipes",
  "/menu": "Back to menu",
  "/library/favourites": "Back to favourites",
  "/library/my-recipes": "Back to my recipes",
  "/library/pending": "Back to pending",
};

// Single leading slash only — rejects `//`/`/\` (protocol-relative) and schemes like `https:`, which <Link> would follow as a real cross-origin href.
function isSafeRelativePath(value: string): boolean {
  return /^\/[^/\\]/.test(value);
}

export function resolveBackDestination(
  from: string | null | undefined,
): BackDestination {
  const trimmed = from?.trim();
  const to = trimmed && isSafeRelativePath(trimmed) ? trimmed : DEFAULT_TO;
  return { to, label: BACK_LABELS[to] ?? BACK_LABELS[DEFAULT_TO] };
}

export function useRecipeBackDestination(): BackDestination {
  const [searchParams] = useSearchParams();
  return resolveBackDestination(searchParams.get("from"));
}
