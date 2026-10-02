import { describe, expect, it } from "vitest";

import type { RecipeFormValues } from "../data/types";
import { publishStatus } from "./publishStatus";
import { defaultRecipeFormValues } from "./recipeFormSchema";

function values(overrides: Partial<RecipeFormValues> = {}): RecipeFormValues {
  return {
    ...defaultRecipeFormValues,
    name: "Beef stew",
    categoryIds: ["c_dinner"],
    ingredients: [
      {
        itemId: "i_beef",
        itemName: "Beef",
        itemCategoryName: "Meat",
        unitId: null,
        quantity: "1",
      },
    ],
    instructions: "Brown the beef.",
    ...overrides,
  };
}

const needed = (message: string) => ({ complete: false, message });

describe("publishStatus", () => {
  it("lists everything an empty form needs, in the design's wording", () => {
    expect(publishStatus(defaultRecipeFormValues)).toEqual(
      needed("Name, categories, ingredients and one step needed to publish"),
    );
  });

  it("lists only what's still missing, capitalising the first", () => {
    expect(publishStatus(values({ instructions: "" }))).toEqual(
      needed("One step needed to publish"),
    );
    expect(publishStatus(values({ categoryIds: [], ingredients: [] }))).toEqual(
      needed("Categories and ingredients needed to publish"),
    );
  });

  it("treats a blank name and numbering-only steps as missing", () => {
    expect(
      publishStatus(values({ name: "   ", instructions: "1.\n\n" })),
    ).toEqual(needed("Name and one step needed to publish"));
  });

  it("says it looks complete once the form would publish", () => {
    expect(publishStatus(values())).toEqual({
      complete: true,
      message: "Looks complete — ready to publish",
    });
  });

  it("flags fixes when nothing is missing but something is invalid", () => {
    expect(publishStatus(values({ name: "ab" }))).toEqual(
      needed("Almost there — a few things to fix before publishing"),
    );
  });
});
