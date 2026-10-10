import { describe, expect, it } from "vitest";

import type { IngredientRow, RecipeFormValues } from "../data/types";
import { defaultRecipeFormValues, recipeFormSchema } from "./recipeFormSchema";

function ingredient(itemId: string, quantity = "1"): IngredientRow {
  return {
    itemId,
    itemName: itemId,
    itemCategoryName: "Veg",
    unitId: null,
    quantity,
  };
}

function validValues(overrides: Partial<RecipeFormValues> = {}) {
  return {
    ...defaultRecipeFormValues,
    name: "Beef stew",
    categoryIds: ["c_dinner"],
    ingredients: [ingredient("i_beef")],
    instructions: "Brown the beef.",
    ...overrides,
  };
}

function errors(values: RecipeFormValues): Record<string, string> {
  const result = recipeFormSchema.safeParse(values);
  if (result.success) return {};
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path.join("."), issue.message]),
  );
}

const lines = (count: number) =>
  Array.from({ length: count }, (_, i) => `Line ${i + 1}`).join("\n");

describe("defaultRecipeFormValues", () => {
  it("starts a new recipe at 30 minutes, serving 4, otherwise empty", () => {
    expect(defaultRecipeFormValues).toEqual({
      name: "",
      image: null,
      description: "",
      timeInMinutes: 30,
      serves: 4,
      categoryIds: [],
      ingredients: [],
      instructions: "",
      notes: "",
    });
  });
});

describe("recipeFormSchema", () => {
  it("accepts a complete recipe", () => {
    expect(errors(validValues())).toEqual({});
  });

  it("reports every gap in an untouched form at once", () => {
    expect(errors(defaultRecipeFormValues)).toEqual({
      name: "Give the recipe a name.",
      categoryIds: "Pick at least one category.",
      ingredients: "Add at least one ingredient.",
      instructions: "Add at least one step.",
    });
  });

  describe("name", () => {
    it("needs at least 3 characters once trimmed", () => {
      expect(errors(validValues({ name: "  ab  " }))).toEqual({
        name: "Use at least 3 characters.",
      });
      expect(errors(validValues({ name: "  abc  " }))).toEqual({});
    });

    it("counts bytes up to 100, as the server does", () => {
      expect(errors(validValues({ name: "a".repeat(100) }))).toEqual({});
      expect(errors(validValues({ name: "a".repeat(101) }))).toEqual({
        name: "Keep the name to 100 characters.",
      });
      expect(errors(validValues({ name: "é".repeat(51) }))).toEqual({
        name: "Keep the name to 100 characters.",
      });
    });
  });

  it("keeps time and serves within the server's ranges", () => {
    expect(errors(validValues({ timeInMinutes: 0, serves: 51 }))).toEqual({
      timeInMinutes: "Cooking time must be 1–1440 minutes.",
      serves: "Serves must be 1–50.",
    });
    expect(errors(validValues({ timeInMinutes: 1440, serves: 1 }))).toEqual({});
  });

  it("allows 1–3 distinct categories", () => {
    expect(errors(validValues({ categoryIds: ["a", "b", "c"] }))).toEqual({});
    expect(errors(validValues({ categoryIds: ["a", "b", "c", "d"] }))).toEqual({
      categoryIds: "Pick up to 3 categories.",
    });
    expect(errors(validValues({ categoryIds: ["a", "a"] }))).toEqual({
      categoryIds: "Pick each category once.",
    });
  });

  describe("ingredients", () => {
    it("allows up to 50", () => {
      const many = (n: number) =>
        Array.from({ length: n }, (_, i) => ingredient(`i_${i}`));
      expect(errors(validValues({ ingredients: many(50) }))).toEqual({});
      expect(errors(validValues({ ingredients: many(51) }))).toEqual({
        ingredients: "Up to 50 ingredients.",
      });
    });

    it("lists each item once", () => {
      expect(
        errors(
          validValues({
            ingredients: [ingredient("i_beef"), ingredient("i_beef")],
          }),
        ),
      ).toEqual({ ingredients: "Each ingredient can only be listed once." });
    });

    it("needs a quantity above 0 on each row, by the shared quantity rule", () => {
      expect(
        errors(
          validValues({
            ingredients: [
              ingredient("i_a", "0"),
              ingredient("i_b", "1.25"),
              ingredient("i_c", "1.255"),
            ],
          }),
        ),
      ).toEqual({
        "ingredients.0.quantity": "Enter a quantity above 0.",
        "ingredients.2.quantity": "Enter a quantity above 0.",
      });
    });
  });

  describe("instructions", () => {
    it("needs a step, not just blank lines or numbering", () => {
      expect(errors(validValues({ instructions: "\n  \n1.\n" }))).toEqual({
        instructions: "Add at least one step.",
      });
    });

    it("allows up to 50 steps, saying how many there are", () => {
      expect(errors(validValues({ instructions: lines(50) }))).toEqual({});
      expect(errors(validValues({ instructions: lines(52) }))).toEqual({
        instructions: "Up to 50 steps. This has 52.",
      });
    });
  });

  it("allows a description up to 500 bytes once trimmed, as the server counts", () => {
    expect(errors(validValues({ description: "" }))).toEqual({});
    expect(
      errors(validValues({ description: ` ${"a".repeat(500)} ` })),
    ).toEqual({});
    expect(errors(validValues({ description: "a".repeat(501) }))).toEqual({
      description: "Keep the description to 500 characters.",
    });
    expect(errors(validValues({ description: "é".repeat(251) }))).toEqual({
      description: "Keep the description to 500 characters.",
    });
  });

  it("allows up to 10 notes, ignoring blank lines", () => {
    expect(errors(validValues({ notes: `${lines(10)}\n\n  \n` }))).toEqual({});
    expect(errors(validValues({ notes: lines(11) }))).toEqual({
      notes: "Up to 10 notes.",
    });
  });
});
