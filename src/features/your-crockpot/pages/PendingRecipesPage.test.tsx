import { useAuth } from "@/features/auth/components/AuthContext";
import type { RecipeCard as RecipeCardData } from "@/features/recipes/data/types";
import { buildUser } from "@/test/authFixtures";
import { FakeIntersectionObserver } from "@/test/fakeIntersectionObserver";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePendingRecipes } from "../hooks/usePendingRecipes";
import { PendingRecipesPage } from "./PendingRecipesPage";

vi.mock("../hooks/usePendingRecipes", () => ({ usePendingRecipes: vi.fn() }));
vi.mock("@/features/auth/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("@/features/recipes/components/RecipeCard", () => ({
  RecipeCard: ({ recipe, from }: { recipe: RecipeCardData; from: string }) => (
    <div data-testid="recipe-card" data-from={from}>
      {recipe.name}
    </div>
  ),
}));
vi.mock("@/features/recipes/components/MobileRecipeRow", () => ({
  MobileRecipeRow: () => null,
}));

function signInAs(role: "ADMIN" | "FREE") {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: true,
    user: buildUser({ role }),
  } as ReturnType<typeof useAuth>);
}

function mockPending(names: string[]) {
  vi.mocked(usePendingRecipes).mockReturnValue({
    data: {
      pages: [
        {
          recipes: names.map((name) => buildRecipeCard({ id: name, name })),
          page: 1,
          limit: 12,
          total: names.length,
          totalPages: 1,
        },
      ],
      pageParams: [1],
    },
    isError: false,
    hasNextPage: false,
    isFetching: false,
    refetch: vi.fn(),
    loadMore: vi.fn(),
  } as unknown as ReturnType<typeof usePendingRecipes>);
}

function renderPage() {
  render(
    <MemoryRouter initialEntries={["/library/pending"]}>
      <Routes>
        <Route path="/library/pending" element={<PendingRecipesPage />} />
        <Route path="/library/favourites" element={<p>favourites page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("PendingRecipesPage", () => {
  it("lists pending recipes, linking back to the Pending tab", () => {
    signInAs("ADMIN");
    mockPending(["Beef stew", "Fish pie"]);
    renderPage();

    const cards = screen.getAllByTestId("recipe-card");
    expect(cards.map((card) => card.textContent)).toEqual([
      "Beef stew",
      "Fish pie",
    ]);
    expect(cards[0]).toHaveAttribute("data-from", "/library/pending");
  });

  it("says when nothing is waiting", () => {
    signInAs("ADMIN");
    mockPending([]);
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Nothing waiting for approval" }),
    ).toBeInTheDocument();
  });

  it("sends anyone who isn't an admin to Favourites", () => {
    signInAs("FREE");
    mockPending([]);
    renderPage();

    expect(screen.getByText("favourites page")).toBeInTheDocument();
  });
});
