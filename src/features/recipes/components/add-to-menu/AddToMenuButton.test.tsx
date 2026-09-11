import { useAddToMenu } from "@/features/menu/hooks/useAddToMenu";
import { useMenuEntry } from "@/features/menu/hooks/useMenuEntry";
import { useRemoveFromMenu } from "@/features/menu/hooks/useRemoveFromMenu";
import { useUpdateMenuEntryServes } from "@/features/menu/hooks/useUpdateMenuEntryServes";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { RecipeCard as RecipeCardData } from "../../types";
import { AddToMenuButton } from "./AddToMenuButton";

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

describe("AddToMenuButton", () => {
  it("shows the cart icon with no badge when not in the menu", () => {
    setup({ isInMenu: false });
    render(<AddToMenuButton recipe={recipe()} />);

    expect(
      screen.getByRole("button", { name: "Add to menu" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("4")).not.toBeInTheDocument();
  });

  it("shows a serves badge and an edit label when already in the menu", () => {
    setup({ isInMenu: true, serves: 6 });
    render(<AddToMenuButton recipe={recipe()} />);

    expect(
      screen.getByRole("button", { name: "Edit menu item" }),
    ).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("disables the cart icon while the menu is still loading", () => {
    setup({ isPending: true });
    render(<AddToMenuButton recipe={recipe()} />);

    expect(
      screen.getByRole("button", { name: "Loading menu status" }),
    ).toBeDisabled();
  });

  it("expands to a serving stepper on click, defaulting to the recipe's own serves", async () => {
    setup({ isInMenu: false });
    render(<AddToMenuButton recipe={recipe({ serves: 4 })} />);

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Add to menu" }));

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirm amount" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /remove from menu/i }),
    ).not.toBeInTheDocument();
  });

  it("confirming a new addition calls addToMenu with the adjusted serves", async () => {
    const { addToMenu } = setup({ isInMenu: false });
    const user = userEvent.setup();
    render(<AddToMenuButton recipe={recipe({ serves: 4 })} />);

    await user.click(screen.getByRole("button", { name: "Add to menu" }));
    await user.click(screen.getByRole("button", { name: "Increase servings" }));
    await user.click(screen.getByRole("button", { name: "Confirm amount" }));

    expect(addToMenu.mutate).toHaveBeenCalledWith(
      { recipe: recipe({ serves: 4 }), serves: 5 },
      expect.anything(),
    );
  });

  it("confirming an edit to an in-menu recipe calls updateMenuEntryServes, not addToMenu", async () => {
    const { updateServes, addToMenu } = setup({ isInMenu: true, serves: 6 });
    const user = userEvent.setup();
    render(<AddToMenuButton recipe={recipe()} />);

    await user.click(screen.getByRole("button", { name: "Edit menu item" }));
    await user.click(screen.getByRole("button", { name: "Confirm amount" }));

    expect(updateServes.mutate).toHaveBeenCalledWith(
      { recipeId: "r_1", serves: 6 },
      expect.anything(),
    );
    expect(addToMenu.mutate).not.toHaveBeenCalled();
  });

  it("disables decrease at the minimum from the start", async () => {
    setup({ isInMenu: false });
    const user = userEvent.setup();
    render(<AddToMenuButton recipe={recipe({ serves: 1 })} />);

    await user.click(screen.getByRole("button", { name: "Add to menu" }));

    expect(
      screen.getByRole("button", { name: "Decrease servings" }),
    ).toBeDisabled();
  });

  it("disables increase once it reaches the maximum of 50", async () => {
    setup({ isInMenu: false });
    const user = userEvent.setup();
    render(<AddToMenuButton recipe={recipe({ serves: 49 })} />);

    await user.click(screen.getByRole("button", { name: "Add to menu" }));
    await user.click(screen.getByRole("button", { name: "Increase servings" }));

    expect(screen.getByText("50")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Increase servings" }),
    ).toBeDisabled();
  });

  it("cancel closes the editor without mutating", async () => {
    const { addToMenu } = setup({ isInMenu: false });
    const user = userEvent.setup();
    render(<AddToMenuButton recipe={recipe()} />);

    await user.click(screen.getByRole("button", { name: "Add to menu" }));
    await user.click(await screen.findByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Confirm amount" }),
      ).not.toBeInTheDocument(),
    );
    expect(addToMenu.mutate).not.toHaveBeenCalled();
  });

  it("removing an in-menu recipe calls removeFromMenu", async () => {
    const { removeFromMenu } = setup({ isInMenu: true, serves: 6 });
    const user = userEvent.setup();
    render(<AddToMenuButton recipe={recipe()} />);

    await user.click(screen.getByRole("button", { name: "Edit menu item" }));
    await user.click(screen.getByRole("button", { name: /remove from menu/i }));

    expect(removeFromMenu.mutate).toHaveBeenCalledWith(
      { recipeId: "r_1" },
      expect.anything(),
    );
  });
});
