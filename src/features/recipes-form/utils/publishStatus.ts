import type { RecipeFormValues } from "../data/types";
import { parseSteps } from "./parseSteps";
import { recipeFormSchema } from "./recipeFormSchema";

function joinList(items: string[]): string {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

const capitalise = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export function publishStatus(values: RecipeFormValues): {
  complete: boolean;
  message: string;
} {
  const missing = [
    values.name.trim() === "" && "name",
    values.categoryIds.length === 0 && "categories",
    values.ingredients.length === 0 && "ingredients",
    parseSteps(values.instructions).length === 0 && "one step",
  ].filter((item) => item !== false);

  if (missing.length > 0) {
    return {
      complete: false,
      message: `${capitalise(joinList(missing))} needed to publish`,
    };
  }
  if (!recipeFormSchema.safeParse(values).success) {
    return {
      complete: false,
      message: "A few things to fix before you can publish",
    };
  }
  return { complete: true, message: "Ready to publish" };
}
