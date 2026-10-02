import { recipePart } from "@/test/recipeRequest";
import { describe, expect, it } from "vitest";

import type { RecipeFormImage } from "../data/types";
import { defaultRecipeFormValues } from "./recipeFormSchema";
import { toRequest } from "./toRequest";

const EXISTING: RecipeFormImage = {
  kind: "existing",
  url: "https://res.cloudinary.com/x.jpg",
};
const shrunk = new File(["jpeg"], "stew.jpg", { type: "image/jpeg" });
const NEW: RecipeFormImage = {
  kind: "new",
  file: shrunk,
  previewUrl: "blob:preview",
};

describe("toRequest", () => {
  it("turns the form's values into the recipe write body", () => {
    expect(
      recipePart(
        toRequest(
          {
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
            image: EXISTING,
          },
          { hadImage: true },
        ),
      ),
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
    });
  });

  it("sends a blank description as null", () => {
    expect(
      recipePart(toRequest({ ...defaultRecipeFormValues, description: "   " }))
        .description,
    ).toBeNull();
  });

  describe("photo", () => {
    const request = (image: RecipeFormImage | null, hadImage: boolean) =>
      toRequest({ ...defaultRecipeFormValues, image }, { hadImage });

    it("keeps an existing photo by sending nothing about it", () => {
      const form = request(EXISTING, true);

      expect(form.get("photo")).toBeNull();
      expect(recipePart(form)).not.toHaveProperty("removeImage");
    });

    it("asks for an existing photo to be removed when it was cleared", () => {
      const form = request(null, true);

      expect(form.get("photo")).toBeNull();
      expect(recipePart(form).removeImage).toBe(true);
    });

    it("sends a new photo in place of an existing one", () => {
      const form = request(NEW, true);

      expect(form.get("photo")).toBe(shrunk);
      expect(recipePart(form)).not.toHaveProperty("removeImage");
    });

    it("sends a new photo on a recipe that had none", () => {
      expect(request(NEW, false).get("photo")).toBe(shrunk);
    });

    it("sends neither when there was never a photo", () => {
      const form = request(null, false);

      expect(form.get("photo")).toBeNull();
      expect(recipePart(form)).not.toHaveProperty("removeImage");
    });
  });
});
