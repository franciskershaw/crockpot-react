import type { RecipeWriteInput } from "@/features/recipes/data/types";

export function recipePart(form: FormData): RecipeWriteInput {
  return JSON.parse(form.get("recipe") as string) as RecipeWriteInput;
}
