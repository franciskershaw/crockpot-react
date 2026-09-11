import { useSearchParams } from "react-router-dom";

interface ResolvedBackLabel {
  to: string;
  label: string;
}

export interface BackDestination extends ResolvedBackLabel {
  canGoBack: boolean;
}

// react-router increments window.history.state.idx on every push; idx > 0 means navigate(-1) has a real entry to land on.
export function canGoBackInApp(): boolean {
  return (window.history.state?.idx ?? 0) > 0;
}

const DEFAULT_TO = "/recipes";

// An unrecognized from is still trusted for navigation, just falls back to the generic label.
const BACK_LABELS: Record<string, string> = {
  [DEFAULT_TO]: "Back to recipes",
};

export function resolveBackDestination(
  from: string | null | undefined,
): ResolvedBackLabel {
  const to = from?.trim() || DEFAULT_TO;
  return { to, label: BACK_LABELS[to] ?? BACK_LABELS[DEFAULT_TO] };
}

export function useRecipeBackDestination(): BackDestination {
  const [searchParams] = useSearchParams();
  return {
    ...resolveBackDestination(searchParams.get("from")),
    canGoBack: canGoBackInApp(),
  };
}
