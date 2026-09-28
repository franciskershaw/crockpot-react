import type { RecipeCard as RecipeCardData } from "@/features/recipes/data/types";
import { FakeIntersectionObserver } from "@/test/fakeIntersectionObserver";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useMyRecipes } from "../hooks/useMyRecipes";
import { MyRecipesPage } from "./MyRecipesPage";

vi.mock("../hooks/useMyRecipes", () => ({ useMyRecipes: vi.fn() }));
vi.mock("@/features/recipes/components/RecipeCard", () => ({
  RecipeCard: ({ recipe, from }: { recipe: RecipeCardData; from: string }) => (
    <div data-testid="recipe-card" data-from={from}>
      <span>{recipe.name}</span>
    </div>
  ),
}));
vi.mock("@/features/recipes/components/MobileRecipeRow", () => ({
  MobileRecipeRow: ({
    recipe,
    from,
  }: {
    recipe: RecipeCardData;
    from: string;
  }) => (
    <div data-testid="mobile-row" data-from={from}>
      <span>{recipe.name}</span>
    </div>
  ),
}));

const loadMore = vi.fn();
const refetch = vi.fn();

function mockMyRecipes(
  pages: string[][] | null,
  state: { isError?: boolean; hasNextPage?: boolean } = {},
) {
  vi.mocked(useMyRecipes).mockReturnValue({
    data: pages && {
      pages: pages.map((names, i) => ({
        recipes: names.map((name) =>
          buildRecipeCard({ id: `${i}_${name}`, name }),
        ),
        page: i + 1,
        limit: 12,
        total: pages.flat().length,
        totalPages: pages.length,
      })),
      pageParams: pages.map((_, i) => i + 1),
    },
    isError: false,
    hasNextPage: false,
    isFetching: false,
    refetch,
    loadMore,
    ...state,
  } as unknown as ReturnType<typeof useMyRecipes>);
}

function names(testId: string) {
  return screen
    .getAllByTestId(testId)
    .map((item) => item.querySelector("span")?.textContent);
}

beforeEach(() => {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

function renderPage() {
  render(
    <MemoryRouter>
      <MyRecipesPage />
    </MemoryRouter>,
  );
}

describe("MyRecipesPage", () => {
  it("shows every loaded recipe as a card, in order across pages", () => {
    mockMyRecipes([["Beef Casserole", "Fajita Wraps"], ["Pulled Pork"]]);
    renderPage();

    expect(names("recipe-card")).toEqual([
      "Beef Casserole",
      "Fajita Wraps",
      "Pulled Pork",
    ]);
    expect(screen.getAllByTestId("recipe-card")[0]).toHaveAttribute(
      "data-from",
      "/library/my-recipes",
    );
  });

  it("shows each recipe as a compact row for mobile", () => {
    mockMyRecipes([["Beef Casserole", "Fajita Wraps"]]);
    renderPage();

    expect(names("mobile-row")).toEqual(["Beef Casserole", "Fajita Wraps"]);
    expect(screen.getAllByTestId("mobile-row")[0]).toHaveAttribute(
      "data-from",
      "/library/my-recipes",
    );
  });

  it("shows the empty state, with a way to create one, when there are none", () => {
    mockMyRecipes([[]]);
    renderPage();

    expect(
      screen.getByRole("heading", { name: "No recipes of your own yet" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Create a recipe")).toBeInTheDocument();
    expect(screen.queryByTestId("recipe-card")).not.toBeInTheDocument();
  });

  it("shows a loading skeleton, not the empty state, while loading", () => {
    mockMyRecipes(null);
    renderPage();

    expect(screen.getByText("Loading your recipes…")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "No recipes of your own yet" }),
    ).not.toBeInTheDocument();
  });

  it("offers a retry when the first load fails", async () => {
    mockMyRecipes(null, { isError: true });
    renderPage();

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(refetch).toHaveBeenCalled();
  });

  it("keeps the list when a later refresh fails", () => {
    mockMyRecipes([["Beef Casserole"]], { isError: true });
    renderPage();

    expect(names("recipe-card")).toEqual(["Beef Casserole"]);
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("asks for more once the end of the list comes into view", () => {
    mockMyRecipes([["Beef Casserole"]], { hasNextPage: true });
    renderPage();
    expect(loadMore).not.toHaveBeenCalled();

    FakeIntersectionObserver.setSentinelInView(true);

    expect(loadMore).toHaveBeenCalled();
  });
});
