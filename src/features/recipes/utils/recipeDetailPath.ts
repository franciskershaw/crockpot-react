export function recipeDetailPath(recipeId: string, from: string): string {
  return `/recipes/${recipeId}?${new URLSearchParams({ from }).toString()}`;
}
