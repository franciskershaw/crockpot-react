import { buildRecipeDetail } from "@/test/recipeFixtures";
import { recipePart } from "@/test/recipeRequest";
import { describe, expect, it } from "vitest";

import { fromDetail } from "./fromDetail";
import { toRequest } from "./toRequest";

const migrated = buildRecipeDetail({
  id: "r_stew",
  name: "Slow Cooker Beef Casserole",
  description: "A freezer-stash regular in our house.",
  imageUrl: "https://res.cloudinary.com/crockpot/image/upload/stew.jpg",
  imageFilename: "crockpot/stew",
  timeInMinutes: 360,
  serves: 6,
  categories: [
    { id: "c_batch", name: "Batch" },
    { id: "c_comfort", name: "Comfort" },
  ],
  ingredients: [
    {
      itemId: "i_beef",
      itemName: "Beef shin",
      itemCategoryId: "ic_meat",
      itemCategoryName: "Meat & Fish",
      unitId: "u_g",
      unitAbbreviation: "g",
      quantity: 800,
    },
    {
      itemId: "i_onion",
      itemName: "Onions",
      itemCategoryId: "ic_veg",
      itemCategoryName: "Fruit & Veg",
      unitId: null,
      unitAbbreviation: null,
      quantity: 1.5,
    },
  ],
  instructions: [
    "Toss the beef shin in flour and season well.",
    "1.5 litres of stock goes in next, with the bay leaves.",
    "2 tbsp tomato purée, then cook on low for 6 hours.",
  ],
  notes: [
    "Freezes brilliantly for up to 3 months.",
    "Swap beef shin for ox cheek if your butcher has it.",
  ],
});

describe("fromDetail", () => {
  it("loads a recipe into the form's values", () => {
    expect(fromDetail(migrated)).toEqual({
      name: "Slow Cooker Beef Casserole",
      image: {
        kind: "existing",
        url: "https://res.cloudinary.com/crockpot/image/upload/stew.jpg",
      },
      description: "A freezer-stash regular in our house.",
      timeInMinutes: 360,
      serves: 6,
      categoryIds: ["c_batch", "c_comfort"],
      ingredients: [
        {
          itemId: "i_beef",
          itemName: "Beef shin",
          itemCategoryName: "Meat & Fish",
          unitId: "u_g",
          quantity: "800",
        },
        {
          itemId: "i_onion",
          itemName: "Onions",
          itemCategoryName: "Fruit & Veg",
          unitId: null,
          quantity: "1.5",
        },
      ],
      instructions:
        "Toss the beef shin in flour and season well.\n1.5 litres of stock goes in next, with the bay leaves.\n2 tbsp tomato purée, then cook on low for 6 hours.",
      notes:
        "Freezes brilliantly for up to 3 months.\nSwap beef shin for ox cheek if your butcher has it.",
    });
  });

  it("round-trips a recipe through toRequest without losing anything", () => {
    expect(recipePart(toRequest(fromDetail(migrated)))).toEqual({
      name: migrated.name,
      description: migrated.description,
      timeInMinutes: migrated.timeInMinutes,
      serves: migrated.serves,
      categoryIds: ["c_batch", "c_comfort"],
      ingredients: [
        { itemId: "i_beef", unitId: "u_g", quantity: 800 },
        { itemId: "i_onion", unitId: null, quantity: 1.5 },
      ],
      instructions: migrated.instructions,
      notes: migrated.notes,
    });
  });

  it("round-trips a recipe with no image, description or notes as empty", () => {
    const plain = buildRecipeDetail({
      name: "Beans on toast",
      instructions: ["Heat the beans."],
    });

    expect(recipePart(toRequest(fromDetail(plain)))).toMatchObject({
      name: "Beans on toast",
      description: null,
      notes: [],
      instructions: ["Heat the beans."],
    });
  });
});
