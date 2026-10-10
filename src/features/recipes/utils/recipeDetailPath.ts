// Allowlist: a from whose path isn't listed here falls back to /recipes, so it can't become an off-site href.
export const BACK_LABELS = {
  "/recipes": "Back to recipes",
  "/menu": "Back to menu",
  "/library/favourites": "Back to favourites",
  "/library/my-recipes": "Back to my recipes",
  "/library/pending": "Back to pending",
} as const satisfies Record<string, string>;

export type BackPath = keyof typeof BACK_LABELS;
export type BackFrom = BackPath | `${BackPath}?${string}`;

export function recipeDetailPath(recipeId: string, from: BackFrom): string {
  return `/recipes/${recipeId}?${new URLSearchParams({ from }).toString()}`;
}
