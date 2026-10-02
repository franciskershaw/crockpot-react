const RECIPE_FORM_PATH = /^\/recipes\/(new|[^/]+\/edit)$/;

export function isRecipeFormPath(pathname: string): boolean {
  return RECIPE_FORM_PATH.test(pathname);
}
