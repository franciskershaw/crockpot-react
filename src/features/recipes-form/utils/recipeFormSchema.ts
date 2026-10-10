import { RECIPE_LIMITS } from "@/features/recipes/utils/recipeLimits";
import { byteLength } from "@/lib/byteLength";
import { parseQuantity } from "@/lib/quantity";
import { z } from "zod";

import type { RecipeFormValues } from "../data/types";
import { parseNotes } from "./parseNotes";
import { parseSteps } from "./parseSteps";

const { time, serves, categories, ingredients, steps, notes } = RECIPE_LIMITS;

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
    image: z
      .discriminatedUnion("kind", [
        z.object({ kind: z.literal("existing"), url: z.string() }),
        z.object({
          kind: z.literal("new"),
          file: z.instanceof(File),
          previewUrl: z.string(),
        }),
      ])
      .nullable(),
    description: z
      .string()
      .refine(
        (value) => byteLength(value.trim()) <= 500,
        "Keep the description to 500 characters.",
      ),
    timeInMinutes: z
      .number()
      .int()
      .min(time.min, `Cooking time must be ${time.min}–${time.max} minutes.`)
      .max(time.max, `Cooking time must be ${time.min}–${time.max} minutes.`),
    serves: z
      .number()
      .int()
      .min(serves.min, `Serves must be ${serves.min}–${serves.max}.`)
      .max(serves.max, `Serves must be ${serves.min}–${serves.max}.`),
    categoryIds: z
      .array(z.string())
      .min(categories.min, "Pick at least one category.")
      .max(categories.max, `Pick up to ${categories.max} categories.`)
      .refine(hasNoDuplicates, "Pick each category once."),
    ingredients: z
      .array(ingredientRowSchema)
      .min(ingredients.min, "Add at least one ingredient.")
      .max(ingredients.max, `Up to ${ingredients.max} ingredients.`)
      .refine(
        (rows) => hasNoDuplicates(rows.map((row) => row.itemId)),
        "Each ingredient can only be listed once.",
      ),
    instructions: z.string().superRefine((value, ctx) => {
      const count = parseSteps(value).length;
      if (count === 0) {
        ctx.addIssue({ code: "custom", message: "Add at least one step." });
      } else if (count > steps.max) {
        ctx.addIssue({
          code: "custom",
          message: `Up to ${steps.max} steps. This has ${count}.`,
        });
      }
    }),
    notes: z
      .string()
      .refine(
        (value) => parseNotes(value).length <= notes.max,
        `Up to ${notes.max} notes.`,
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
