import { useMenuEntry } from "@/features/menu/hooks/useMenuEntry";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { HydratedIngredient, RecipeDetail } from "../types";
import { IngredientsSection } from "./IngredientsSection";

vi.mock("@/features/menu/hooks/useMenuEntry", () => ({
  useMenuEntry: vi.fn(),
}));

const mockUseMenuEntry = vi.mocked(useMenuEntry);

afterEach(() => {
  vi.clearAllMocks();
});

function ingredient(
  overrides: Partial<HydratedIngredient> = {},
): HydratedIngredient {
  return {
    itemId: "i_1",
    itemName: "Onion",
    itemCategoryId: "c_1",
    itemCategoryName: "Veg",
    unitId: null,
    unitAbbreviation: null,
    quantity: 2,
    ...overrides,
  };
}

function recipe(overrides: Partial<RecipeDetail> = {}): RecipeDetail {
  return {
    id: "r_1",
    name: "Slow Cooker Beef Casserole",
    imageUrl: null,
    imageFilename: null,
    timeInMinutes: 360,
    serves: 4,
    approved: true,
    categories: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    isFavourite: false,
    matchedIngredientCount: 0,
    totalIngredientCount: 0,
    matchedCategoryCount: 0,
    score: 0,
    tier: null,
    description: null,
    instructions: [],
    notes: [],
    ingredients: [
      ingredient({ itemId: "i_1", itemName: "Onion", itemCategoryName: "Veg" }),
      ingredient({
        itemId: "i_2",
        itemName: "Beef shin",
        itemCategoryName: "Meat",
        quantity: 800,
        unitAbbreviation: "g",
      }),
      ingredient({
        itemId: "i_3",
        itemName: "Carrot",
        itemCategoryName: "Veg",
        quantity: 4,
      }),
    ],
    createdById: "u_1",
    createdByName: "Jamie",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("IngredientsSection", () => {
  it("renders the ingredient count and each ingredient's quantity/unit/name", () => {
    mockUseMenuEntry.mockReturnValue({
      isInMenu: false,
      serves: undefined,
      isPending: false,
    });
    render(<IngredientsSection recipe={recipe()} />);

    expect(screen.getByText("Ingredients (3)")).toBeInTheDocument();
    expect(screen.getByText("800")).toBeInTheDocument();
    expect(screen.getByText("g")).toBeInTheDocument();
    expect(screen.getByText("Beef shin")).toBeInTheDocument();
  });

  it("groups ingredients under their category, in first-seen order", () => {
    mockUseMenuEntry.mockReturnValue({
      isInMenu: false,
      serves: undefined,
      isPending: false,
    });
    render(<IngredientsSection recipe={recipe()} />);

    const headings = screen
      .getAllByRole("heading", { level: 3 })
      .map((el) => el.textContent);
    expect(headings).toEqual(["Veg", "Meat"]);
  });

  it("initializes serves from the recipe's own serves when not in the menu", () => {
    mockUseMenuEntry.mockReturnValue({
      isInMenu: false,
      serves: undefined,
      isPending: false,
    });
    render(<IngredientsSection recipe={recipe({ serves: 4 })} />);

    expect(
      within(screen.getByRole("group", { name: "Servings" })).getByText("4"),
    ).toBeInTheDocument();
  });

  it("initializes serves from the menu entry's serves when already in the menu", () => {
    mockUseMenuEntry.mockReturnValue({
      isInMenu: true,
      serves: 8,
      isPending: false,
    });
    render(<IngredientsSection recipe={recipe({ serves: 4 })} />);

    expect(
      within(screen.getByRole("group", { name: "Servings" })).getByText("8"),
    ).toBeInTheDocument();
  });

  it("scales displayed quantities when the stepper is adjusted, without touching the menu", async () => {
    mockUseMenuEntry.mockReturnValue({
      isInMenu: false,
      serves: undefined,
      isPending: false,
    });
    const user = userEvent.setup();
    render(<IngredientsSection recipe={recipe({ serves: 4 })} />);

    await user.click(screen.getByRole("button", { name: "Increase servings" }));

    expect(
      within(screen.getByRole("group", { name: "Servings" })).getByText("5"),
    ).toBeInTheDocument();
    // Beef shin: 800g at serves 4 -> 1000g at serves 5.
    expect(screen.getByText("1000")).toBeInTheDocument();
  });

  it("disables decrease at the minimum of 1", () => {
    mockUseMenuEntry.mockReturnValue({
      isInMenu: false,
      serves: undefined,
      isPending: false,
    });
    render(<IngredientsSection recipe={recipe({ serves: 1 })} />);

    expect(
      screen.getByRole("button", { name: "Decrease servings" }),
    ).toBeDisabled();
  });

  it("disables increase at the maximum of 50", () => {
    mockUseMenuEntry.mockReturnValue({
      isInMenu: false,
      serves: undefined,
      isPending: false,
    });
    render(<IngredientsSection recipe={recipe({ serves: 50 })} />);

    expect(
      screen.getByRole("button", { name: "Increase servings" }),
    ).toBeDisabled();
  });
});
