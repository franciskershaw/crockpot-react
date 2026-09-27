import type { RecipeCard as RecipeCardData } from "@/features/recipes/data/types";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useClearMenu } from "../hooks/useClearMenu";
import { useMenu } from "../hooks/useMenu";
import { MenuPage } from "./MenuPage";

vi.mock("../hooks/useMenu", () => ({ useMenu: vi.fn() }));
vi.mock("../hooks/useClearMenu", () => ({ useClearMenu: vi.fn() }));
vi.mock("@/features/recipes/components/RecipeCard", () => ({
  RecipeCard: ({ recipe, from }: { recipe: RecipeCardData; from: string }) => (
    <div data-testid="recipe-card" data-from={from}>
      {recipe.name}
    </div>
  ),
}));
vi.mock("@/features/shopping-list/components/ShoppingListPanel", () => ({
  ShoppingListPanel: () => <aside data-testid="shopping-list" />,
}));

const clear = vi.fn();

beforeEach(() => {
  clear.mockReset();
  vi.mocked(useClearMenu).mockReturnValue({
    mutate: clear,
    isPending: false,
  } as unknown as ReturnType<typeof useClearMenu>);
});

function renderWith(names: string[] | null) {
  vi.mocked(useMenu).mockReturnValue({
    data:
      names === null
        ? undefined
        : {
            entries: names.map((name, i) => ({
              recipeId: `r_${i}`,
              serves: 4,
              recipe: buildRecipeCard({ id: `r_${i}`, name }),
            })),
          },
  } as unknown as ReturnType<typeof useMenu>);
  render(
    <MemoryRouter>
      <MenuPage />
    </MemoryRouter>,
  );
}

describe("MenuPage", () => {
  it("shows each recipe on the menu as a card, beside the shopping list", () => {
    renderWith(["Beef Casserole", "Fajita Wraps"]);

    const cards = screen.getAllByTestId("recipe-card");
    expect(cards.map((card) => card.textContent)).toEqual([
      "Beef Casserole",
      "Fajita Wraps",
    ]);
    expect(cards[0]).toHaveAttribute("data-from", "/menu");
    expect(screen.getByTestId("shopping-list")).toBeInTheDocument();
  });

  it("says how many recipes are on the menu in the footer", () => {
    renderWith(["Beef Casserole", "Fajita Wraps"]);
    expect(screen.getByText("2 recipes on your menu")).toBeInTheDocument();
  });

  it("asks for confirmation before clearing the menu", async () => {
    renderWith(["Beef Casserole"]);

    expect(screen.getByText("1 recipe on your menu")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear menu" }));
    const dialog = await screen.findByRole("dialog");
    expect(clear).not.toHaveBeenCalled();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Clear menu" }),
    );

    expect(clear).toHaveBeenCalled();
  });

  it("shows the empty state, and a way to browse, when nothing is on the menu", () => {
    renderWith([]);

    expect(
      screen.getByRole("heading", { name: "Nothing on the menu yet" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("recipe-card")).not.toBeInTheDocument();
    expect(screen.getByText("Menu is empty")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Browse recipes" }),
    ).toHaveAttribute("href", "/recipes");
    expect(
      screen.queryByRole("button", { name: "Clear menu" }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("shopping-list")).toBeInTheDocument();
  });

  it("shows neither cards nor the empty state while the menu is loading", () => {
    renderWith(null);

    expect(screen.queryByTestId("recipe-card")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Nothing on the menu yet" }),
    ).not.toBeInTheDocument();
  });
});
