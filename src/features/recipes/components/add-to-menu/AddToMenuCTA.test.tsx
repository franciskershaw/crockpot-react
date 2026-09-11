import { useAddToMenu } from "@/features/menu/hooks/useAddToMenu";
import { useMenuEntry } from "@/features/menu/hooks/useMenuEntry";
import { useRemoveFromMenu } from "@/features/menu/hooks/useRemoveFromMenu";
import { useUpdateMenuEntryServes } from "@/features/menu/hooks/useUpdateMenuEntryServes";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { RecipeCard as RecipeCardData } from "../../types";
import { AddToMenuCTA } from "./AddToMenuCTA";

vi.mock("@/features/menu/hooks/useMenuEntry", () => ({
  useMenuEntry: vi.fn(),
}));
vi.mock("@/features/menu/hooks/useAddToMenu", () => ({
  useAddToMenu: vi.fn(),
}));
vi.mock("@/features/menu/hooks/useUpdateMenuEntryServes", () => ({
  useUpdateMenuEntryServes: vi.fn(),
}));
vi.mock("@/features/menu/hooks/useRemoveFromMenu", () => ({
  useRemoveFromMenu: vi.fn(),
}));

const mockUseMenuEntry = vi.mocked(useMenuEntry);
const mockUseAddToMenu = vi.mocked(useAddToMenu);
const mockUseUpdateMenuEntryServes = vi.mocked(useUpdateMenuEntryServes);
const mockUseRemoveFromMenu = vi.mocked(useRemoveFromMenu);

afterEach(() => {
  vi.clearAllMocks();
});

function recipe(overrides: Partial<RecipeCardData> = {}): RecipeCardData {
  return {
    id: "r_1",
    name: "BBQ Pulled Pork",
    imageUrl: null,
    imageFilename: null,
    timeInMinutes: 30,
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
    ...overrides,
  };
}

function setup({
  isInMenu = false,
  serves,
  isPending = false,
}: {
  isInMenu?: boolean;
  serves?: number;
  isPending?: boolean;
} = {}) {
  mockUseMenuEntry.mockReturnValue({ isInMenu, serves, isPending });
  const addToMenu = { mutate: vi.fn(), isPending: false };
  const updateServes = { mutate: vi.fn(), isPending: false };
  const removeFromMenu = { mutate: vi.fn(), isPending: false };
  mockUseAddToMenu.mockReturnValue(
    addToMenu as unknown as ReturnType<typeof useAddToMenu>,
  );
  mockUseUpdateMenuEntryServes.mockReturnValue(
    updateServes as unknown as ReturnType<typeof useUpdateMenuEntryServes>,
  );
  mockUseRemoveFromMenu.mockReturnValue(
    removeFromMenu as unknown as ReturnType<typeof useRemoveFromMenu>,
  );
  return { addToMenu, updateServes, removeFromMenu };
}

describe.each(["desktop", "mobile"] as const)(
  "AddToMenuCTA (%s)",
  (variant) => {
    it('shows "Add to Menu" with no badge when not in the menu', () => {
      setup({ isInMenu: false });
      render(<AddToMenuCTA recipe={recipe()} variant={variant} />);

      expect(
        screen.getByRole("button", { name: "Add to menu" }),
      ).toHaveTextContent("Add to Menu");
      expect(screen.queryByText("4")).not.toBeInTheDocument();
    });

    it('shows "In Menu" with a serves badge when already in the menu', () => {
      setup({ isInMenu: true, serves: 6 });
      render(<AddToMenuCTA recipe={recipe()} variant={variant} />);

      expect(
        screen.getByRole("button", { name: "Edit menu item" }),
      ).toHaveTextContent("In Menu");
      expect(screen.getByText("6")).toBeInTheDocument();
    });

    it("disables the CTA while the menu is still loading", () => {
      setup({ isPending: true });
      render(<AddToMenuCTA recipe={recipe()} variant={variant} />);

      expect(
        screen.getByRole("button", { name: "Loading menu status" }),
      ).toBeDisabled();
    });

    it("expands to a serving stepper on click, with a way to cancel out", async () => {
      setup({ isInMenu: false });
      render(<AddToMenuCTA recipe={recipe({ serves: 4 })} variant={variant} />);

      await userEvent
        .setup()
        .click(screen.getByRole("button", { name: "Add to menu" }));

      expect(screen.getByText("4")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Confirm amount" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" }),
      ).toBeInTheDocument();
      expect(screen.queryByText("Remove from menu")).not.toBeInTheDocument();
    });

    it("cancelling collapses back to the idle state without mutating", async () => {
      const { addToMenu } = setup({ isInMenu: false });
      const user = userEvent.setup();
      render(<AddToMenuCTA recipe={recipe({ serves: 4 })} variant={variant} />);

      await user.click(screen.getByRole("button", { name: "Add to menu" }));
      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(
        screen.getByRole("button", { name: "Add to menu" }),
      ).toBeInTheDocument();
      expect(addToMenu.mutate).not.toHaveBeenCalled();
    });

    it("shows Remove (not Cancel's X) once already in the menu", async () => {
      setup({ isInMenu: true, serves: 6 });
      render(<AddToMenuCTA recipe={recipe()} variant={variant} />);

      await userEvent
        .setup()
        .click(screen.getByRole("button", { name: "Edit menu item" }));

      expect(screen.getByText("Remove from menu")).toBeInTheDocument();
    });

    it("confirming a new addition calls addToMenu with the adjusted serves", async () => {
      const { addToMenu } = setup({ isInMenu: false });
      const user = userEvent.setup();
      render(<AddToMenuCTA recipe={recipe({ serves: 4 })} variant={variant} />);

      await user.click(screen.getByRole("button", { name: "Add to menu" }));
      await user.click(
        screen.getByRole("button", { name: "Increase servings" }),
      );
      await user.click(screen.getByRole("button", { name: "Confirm amount" }));

      expect(addToMenu.mutate).toHaveBeenCalledWith(
        { recipe: recipe({ serves: 4 }), serves: 5 },
        expect.anything(),
      );
    });

    it("removing calls removeFromMenu", async () => {
      const { removeFromMenu } = setup({ isInMenu: true, serves: 6 });
      const user = userEvent.setup();
      render(<AddToMenuCTA recipe={recipe()} variant={variant} />);

      await user.click(screen.getByRole("button", { name: "Edit menu item" }));
      await user.click(
        screen.getByRole("button", { name: "Remove from menu" }),
      );

      expect(removeFromMenu.mutate).toHaveBeenCalledWith(
        { recipeId: "r_1" },
        expect.anything(),
      );
    });
  },
);
