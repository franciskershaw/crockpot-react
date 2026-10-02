import type { RecipeWriteInput } from "@/features/recipes/data/types";

import type { RecipeFormValues } from "../data/types";
import { parseNotes } from "./parseNotes";
import { parseSteps } from "./parseSteps";

export function toRequest(values: RecipeFormValues): RecipeWriteInput {
  const description = values.description.trim();
  return {
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
    image:
      values.image?.kind === "existing"
        ? { url: values.image.url, filename: values.image.filename }
        : null,
  };
}
