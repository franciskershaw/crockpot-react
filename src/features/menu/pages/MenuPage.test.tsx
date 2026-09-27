import type { RecipeCard as RecipeCardData } from "@/features/recipes/data/types";
import { buildRecipeCard } from "@/test/recipeFixtures";
import {
  act,
  render,
  screen,
  waitFor,
  within,
  type RenderResult,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { MemoryRouter } from "react-router-dom";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { useAddToMenu } from "../hooks/useAddToMenu";
import { useClearMenu } from "../hooks/useClearMenu";
import { useMenu } from "../hooks/useMenu";
import { useRemoveFromMenu } from "../hooks/useRemoveFromMenu";
import { UNDO_WINDOW_MS } from "../hooks/useUndoableMenuRemoval";
import { MenuPage } from "./MenuPage";

vi.mock("../hooks/useMenu", () => ({ useMenu: vi.fn() }));
vi.mock("../hooks/useClearMenu", () => ({ useClearMenu: vi.fn() }));
vi.mock("../hooks/useAddToMenu", () => ({ useAddToMenu: vi.fn() }));
vi.mock("../hooks/useRemoveFromMenu", () => ({ useRemoveFromMenu: vi.fn() }));
vi.mock("@/features/recipes/components/RecipeCard", () => ({
  RecipeCard: ({
    recipe,
    from,
    onRemoveFromMenu,
  }: {
    recipe: RecipeCardData;
    from: string;
    onRemoveFromMenu?: () => void;
  }) => (
    <div data-testid="recipe-card" data-from={from}>
      <span>{recipe.name}</span>
      <button type="button" onClick={() => onRemoveFromMenu?.()}>
        Remove {recipe.name}
      </button>
    </div>
  ),
}));
vi.mock("@/features/recipes/components/MobileRecipeRow", () => ({
  MobileRecipeRow: ({
    recipe,
    from,
    onRemoveFromMenu,
  }: {
    recipe: RecipeCardData;
    from: string;
    onRemoveFromMenu?: () => void;
  }) => (
    <div data-testid="mobile-row" data-from={from}>
      <span>{recipe.name}</span>
      <button type="button" onClick={() => onRemoveFromMenu?.()}>
        Remove {recipe.name} on mobile
      </button>
    </div>
  ),
}));
vi.mock("@/features/shopping-list/components/ShoppingListSheet", () => ({
  ShoppingListSheet: () => <div data-testid="shopping-list-sheet" />,
}));
vi.mock("@/features/shopping-list/components/ShoppingListPanel", () => ({
  ShoppingListPanel: () => <aside data-testid="shopping-list" />,
}));

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});

afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const clear = vi.fn();
const addToMenu = vi.fn();
const removeFromMenu = vi.fn();

beforeEach(() => {
  clear.mockReset();
  vi.mocked(useAddToMenu).mockReturnValue({
    mutate: addToMenu,
    isPending: false,
  } as unknown as ReturnType<typeof useAddToMenu>);
  vi.mocked(useRemoveFromMenu).mockReturnValue({
    mutate: removeFromMenu,
    isPending: false,
  } as unknown as ReturnType<typeof useRemoveFromMenu>);
  vi.mocked(useClearMenu).mockReturnValue({
    mutate: clear,
    isPending: false,
  } as unknown as ReturnType<typeof useClearMenu>);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

function renderWith(
  names: string[] | null,
  rerender?: RenderResult["rerender"],
) {
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
  const page = (
    <MemoryRouter>
      <MenuPage />
    </MemoryRouter>
  );
  if (rerender) {
    rerender(page);
    return { rerender };
  }
  return render(page);
}

function slotKinds(container: HTMLElement, recipeTestId: string) {
  const undoTile = within(container).queryByRole("status");
  return [
    ...container.querySelectorAll(`[data-testid="${recipeTestId}"], output`),
  ].map((slot) => (slot === undoTile ? "undo" : "recipe"));
}

function menuWithout(names: string[], removed: string) {
  return {
    data: {
      entries: names
        .map((name, i) => ({
          recipeId: `r_${i}`,
          serves: 4,
          recipe: buildRecipeCard({ id: `r_${i}`, name }),
        }))
        .filter((entry) => entry.recipe.name !== removed),
    },
  } as unknown as ReturnType<typeof useMenu>;
}

describe("MenuPage", () => {
  it("shows each recipe on the menu as a card, beside the shopping list", () => {
    renderWith(["Beef Casserole", "Fajita Wraps"]);

    const cards = screen.getAllByTestId("recipe-card");
    expect(
      cards.map((card) => card.querySelector("span")?.textContent),
    ).toEqual(["Beef Casserole", "Fajita Wraps"]);
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

  it("puts an undo in the removed recipe's place, and undo adds it back", async () => {
    const names = ["Beef Casserole", "Fajita Wraps", "Pulled Pork"];
    const { rerender } = renderWith(names);

    await userEvent.click(
      screen.getByRole("button", { name: "Remove Fajita Wraps" }),
    );
    expect(removeFromMenu).toHaveBeenCalledWith(
      { recipeId: "r_1" },
      expect.anything(),
    );
    vi.mocked(useMenu).mockReturnValue(menuWithout(names, "Fajita Wraps"));
    rerender(
      <MemoryRouter>
        <MenuPage />
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("menu-grid");
    const undoTile = await within(grid).findByRole("status");
    expect(slotKinds(grid, "recipe-card")).toEqual([
      "recipe",
      "undo",
      "recipe",
    ]);
    expect(undoTile).toHaveTextContent("Removed Fajita Wraps");

    await userEvent.click(
      within(undoTile).getByRole("button", { name: "Undo" }),
    );

    expect(addToMenu).toHaveBeenCalledWith({
      recipe: expect.objectContaining({ id: "r_1" }),
      serves: 4,
      index: 1,
    });

    renderWith(names, rerender);
    await waitFor(() =>
      expect(screen.queryAllByRole("status")).toHaveLength(0),
    );
  });

  it("drops the undo after a few seconds", async () => {
    const names = ["Beef Casserole", "Fajita Wraps"];
    renderWith(names);

    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(useMenu).mockReturnValue(menuWithout(names, "Fajita Wraps"));
    act(() =>
      screen.getByRole("button", { name: "Remove Fajita Wraps" }).click(),
    );
    expect((await screen.findAllByRole("status")).length).toBeGreaterThan(0);

    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS));

    await waitFor(() =>
      expect(screen.queryAllByRole("status")).toHaveLength(0),
    );
  });

  it("shows each recipe as a compact row for mobile", () => {
    renderWith(["Beef Casserole", "Fajita Wraps"]);

    const rows = screen.getAllByTestId("mobile-row");
    expect(rows.map((row) => row.querySelector("span")?.textContent)).toEqual([
      "Beef Casserole",
      "Fajita Wraps",
    ]);
    expect(rows[0]).toHaveAttribute("data-from", "/menu");
  });

  it("puts an undo in a removed row's place on mobile too", async () => {
    const names = ["Beef Casserole", "Fajita Wraps", "Pulled Pork"];
    const { rerender } = renderWith(names);

    await userEvent.click(
      screen.getByRole("button", { name: "Remove Fajita Wraps on mobile" }),
    );
    vi.mocked(useMenu).mockReturnValue(menuWithout(names, "Fajita Wraps"));
    rerender(
      <MemoryRouter>
        <MenuPage />
      </MemoryRouter>,
    );

    const list = screen.getByTestId("menu-list");
    await within(list).findByRole("status");
    expect(slotKinds(list, "mobile-row")).toEqual(["recipe", "undo", "recipe"]);
  });

  it("offers the shopping list as a sheet for mobile", () => {
    renderWith(["Beef Casserole"]);
    expect(screen.getByTestId("shopping-list-sheet")).toBeInTheDocument();
  });

  describe("while loading and on failure", () => {
    function renderState(state: {
      data?: {
        entries: { recipeId: string; serves: number; recipe: RecipeCardData }[];
      };
      isPending?: boolean;
      isError?: boolean;
    }) {
      const refetch = vi.fn();
      vi.mocked(useMenu).mockReturnValue({
        data: undefined,
        isPending: false,
        isError: false,
        refetch,
        ...state,
      } as unknown as ReturnType<typeof useMenu>);
      render(
        <MemoryRouter>
          <MenuPage />
        </MemoryRouter>,
      );
      return { refetch };
    }

    it("shows a loading placeholder, not a blank column, until the menu arrives", () => {
      renderState({ isPending: true });

      expect(screen.getByText("Loading your menu…")).toBeInTheDocument();
      expect(screen.queryByTestId("menu-grid")).not.toBeInTheDocument();
      expect(screen.queryByText("Menu is empty")).not.toBeInTheDocument();
    });

    it("offers a retry when the menu fails to load", async () => {
      const { refetch } = renderState({ isPending: true, isError: true });

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Retry" }));
      expect(refetch).toHaveBeenCalled();
    });

    it("keeps the menu on screen when a later refresh fails", () => {
      renderState({
        isError: true,
        data: {
          entries: [
            {
              recipeId: "r_0",
              serves: 4,
              recipe: buildRecipeCard({ id: "r_0", name: "Beef Casserole" }),
            },
          ],
        },
      });

      expect(screen.getAllByText("Beef Casserole").length).toBeGreaterThan(0);
      expect(
        screen.queryByText("Something went wrong"),
      ).not.toBeInTheDocument();
    });

    it("keeps the shopping list available while the menu fails", () => {
      renderState({ isPending: true, isError: true });

      expect(screen.getByTestId("shopping-list")).toBeInTheDocument();
    });
  });
});
