import { useSearchParams } from "react-router-dom";

export interface BackDestination {
  to: string;
  label: string;
}

const DEFAULT_TO = "/recipes";

// An unrecognized from is still trusted for navigation, just falls back to the generic label.
const BACK_LABELS: Record<string, string> = {
  [DEFAULT_TO]: "Back to recipes",
};

export function resolveBackDestination(
  from: string | null | undefined,
): BackDestination {
  const to = from?.trim() || DEFAULT_TO;
  return { to, label: BACK_LABELS[to] ?? BACK_LABELS[DEFAULT_TO] };
}

export function useRecipeBackDestination(): BackDestination {
  const [searchParams] = useSearchParams();
  return resolveBackDestination(searchParams.get("from"));
}
