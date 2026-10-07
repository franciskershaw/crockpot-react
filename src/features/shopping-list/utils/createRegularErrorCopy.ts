import type { ApiError } from "@/lib/http/client";

const COPY: Record<string, string> = {
  regular_exists: "That's already one of your regulars.",
  regulars_limit_reached:
    "You've reached the 50-regular limit. Remove one to add another.",
};

export function createRegularErrorCopy(error: ApiError | null): string | null {
  if (error?.status !== 409 || !Object.hasOwn(COPY, error.message)) return null;
  return COPY[error.message];
}
