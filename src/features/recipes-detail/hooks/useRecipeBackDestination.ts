import {
  BACK_LABELS,
  type BackPath,
} from "@/features/recipes/utils/recipeDetailPath";
import { useSearchParams } from "react-router-dom";

interface BackDestination {
  to: string;
  label: string;
}

const DEFAULT_TO: BackPath = "/recipes";

function isBackPath(path: string): path is BackPath {
  return Object.hasOwn(BACK_LABELS, path);
}

export function resolveBackDestination(
  from: string | null | undefined,
): BackDestination {
  const to = from?.trim() ?? "";
  const path = to.split("?", 1)[0].replace(/\/$/, "");
  if (!isBackPath(path)) {
    return { to: DEFAULT_TO, label: BACK_LABELS[DEFAULT_TO] };
  }
  return { to, label: BACK_LABELS[path] };
}

export function useRecipeBackDestination(): BackDestination {
  const [searchParams] = useSearchParams();
  return resolveBackDestination(searchParams.get("from"));
}
