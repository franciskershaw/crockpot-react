import type { ApiError } from "@/lib/http/client";

const COPY: Record<string, { status: number; copy: string }> = {
  menu_limit_reached: {
    status: 409,
    copy: "You've reached the 30-recipe menu limit. Remove one to add another.",
  },
  shopping_list_quantity_too_large: {
    status: 400,
    copy: "That would push a shopping-list quantity past the largest amount we can store.",
  },
};

export function menuErrorCopy(error: ApiError | null): string | null {
  if (!error || !Object.hasOwn(COPY, error.message)) return null;
  const entry = COPY[error.message];
  return entry.status === error.status ? entry.copy : null;
}
