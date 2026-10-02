import { describe, expect, it } from "vitest";

import { defaultRecipeFormValues } from "./recipeFormSchema";
import { toRequest } from "./toRequest";

describe("toRequest", () => {
  it("turns the form's values into the recipe write body", () => {
    expect(
      toRequest({
        ...defaultRecipeFormValues,
        name: "  Beef stew  ",
        description: "  A freezer-stash regular.  ",
        timeInMinutes: 360,
        serves: 6,
        categoryIds: ["c_batch", "c_comfort"],
        ingredients: [
          {
            itemId: "i_beef",
            itemName: "Beef shin",
            itemCategoryName: "Meat",
            unitId: "u_g",
            quantity: "800",
          },
          {
            itemId: "i_onion",
            itemName: "Onions",
            itemCategoryName: "Veg",
            unitId: null,
            quantity: "1.5",
          },
        ],
        instructions: "1. Brown the beef.\n\n2) Add the onions.\n",
        notes: "Freezes well.\n\n  Even better the next day.  \n",
        image: {
          kind: "existing",
          url: "https://res.cloudinary.com/x.jpg",
          filename: "x",
        },
      }),
    ).toEqual({
      name: "Beef stew",
      description: "A freezer-stash regular.",
      timeInMinutes: 360,
      serves: 6,
      categoryIds: ["c_batch", "c_comfort"],
      ingredients: [
        { itemId: "i_beef", unitId: "u_g", quantity: 800 },
        { itemId: "i_onion", unitId: null, quantity: 1.5 },
      ],
      instructions: ["Brown the beef.", "Add the onions."],
      notes: ["Freezes well.", "Even better the next day."],
      image: { url: "https://res.cloudinary.com/x.jpg", filename: "x" },
    });
  });

  it("sends a blank description as null", () => {
    expect(
      toRequest({ ...defaultRecipeFormValues, description: "   " }).description,
    ).toBeNull();
  });
});
