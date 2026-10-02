import type { RecipeWriteInput } from "@/features/recipes/data/types";

import type { RecipeFormValues } from "../data/types";
import { parseNotes } from "./parseNotes";
import { parseSteps } from "./parseSteps";

export function toRequest(
  values: RecipeFormValues,
  { hadImage }: { hadImage: boolean } = { hadImage: false },
): FormData {
  const description = values.description.trim();
  const recipe: RecipeWriteInput = {
    name: values.name.trim(),
    description: description === "" ? null : description,
    timeInMinutes: values.timeInMinutes,
    serves: values.serves,
    instructions: parseSteps(values.instructions),
    notes: parseNotes(values.notes),
    categoryIds: values.categoryIds,
    ingredients: values.ingredients.map((row) => ({
      itemId: row.itemId,
      unitId: row.unitId,
      quantity: Number(row.quantity),
    })),
  };
  if (hadImage && values.image === null) recipe.removeImage = true;

  const form = new FormData();
  form.set("recipe", JSON.stringify(recipe));
  if (values.image?.kind === "new") form.set("photo", values.image.file);
  return form;
}
