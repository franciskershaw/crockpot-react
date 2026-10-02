import { parseQuantity } from "@/lib/quantity";
import { z } from "zod";

import type { RecipeFormValues } from "../data/types";
import { parseNotes } from "./parseNotes";
import { parseSteps } from "./parseSteps";

export const MAX_STEPS = 50;
export const MAX_NOTES = 10;

// The server checks name and description length with Go's len(), which counts bytes.
const byteLength = (value: string) => new TextEncoder().encode(value).length;

const hasNoDuplicates = (values: string[]) =>
  new Set(values).size === values.length;

const ingredientRowSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  itemCategoryName: z.string(),
  unitId: z.string().nullable(),
  quantity: z
    .string()
    .refine(
      (value) => parseQuantity(value) !== null,
      "Enter a quantity above 0.",
    ),
});

export const recipeFormSchema: z.ZodType<RecipeFormValues, RecipeFormValues> =
  z.object({
    name: z.string().superRefine((value, ctx) => {
      const name = value.trim();
      if (name === "") {
        ctx.addIssue({ code: "custom", message: "Give the recipe a name." });
      } else if (byteLength(name) < 3) {
        ctx.addIssue({ code: "custom", message: "Use at least 3 characters." });
      } else if (byteLength(name) > 100) {
        ctx.addIssue({
          code: "custom",
          message: "Keep the name to 100 characters.",
        });
      }
    }),
    image: z.object({ url: z.string(), filename: z.string() }).nullable(),
    description: z
      .string()
      .refine(
        (value) => byteLength(value.trim()) <= 500,
        "Keep the description to 500 characters.",
      ),
    timeInMinutes: z
      .number()
      .int()
      .min(1, "Cooking time must be 1–1440 minutes.")
      .max(1440, "Cooking time must be 1–1440 minutes."),
    serves: z
      .number()
      .int()
      .min(1, "Serves must be 1–50.")
      .max(50, "Serves must be 1–50."),
    categoryIds: z
      .array(z.string())
      .min(1, "Pick at least one category.")
      .max(3, "Pick up to 3 categories.")
      .refine(hasNoDuplicates, "Pick each category once."),
    ingredients: z
      .array(ingredientRowSchema)
      .min(1, "Add at least one ingredient.")
      .max(50, "Up to 50 ingredients.")
      .refine(
        (rows) => hasNoDuplicates(rows.map((row) => row.itemId)),
        "Each ingredient can only be listed once.",
      ),
    instructions: z.string().superRefine((value, ctx) => {
      const count = parseSteps(value).length;
      if (count === 0) {
        ctx.addIssue({ code: "custom", message: "Add at least one step." });
      } else if (count > MAX_STEPS) {
        ctx.addIssue({
          code: "custom",
          message: `Up to ${MAX_STEPS} steps — this has ${count}.`,
        });
      }
    }),
    notes: z
      .string()
      .refine(
        (value) => parseNotes(value).length <= MAX_NOTES,
        `Up to ${MAX_NOTES} notes.`,
      ),
  });

export const defaultRecipeFormValues: RecipeFormValues = {
  name: "",
  image: null,
  description: "",
  timeInMinutes: 30,
  serves: 4,
  categoryIds: [],
  ingredients: [],
  instructions: "",
  notes: "",
};
