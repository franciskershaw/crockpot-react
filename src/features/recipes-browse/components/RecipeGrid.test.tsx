import { useAuth } from "@/features/auth/components/AuthContext";
import { listRecipes } from "@/features/recipes/data/api";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { renderWithProviders } from "@/test/renderWithProviders";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RecipeGrid } from "./RecipeGrid";

vi.mock("@/features/recipes/data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/recipes/data/api")>()),
  listRecipes: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("@/features/auth/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockListRecipes = vi.mocked(listRecipes);
const mockUseAuth = vi.mocked(useAuth);

afterEach(() => {
  vi.clearAllMocks();
});

describe("RecipeGrid", () => {
  it("shows a retry affordance when the list fails to load, and refetches on click", async () => {
    mockListRecipes.mockRejectedValue(new Error("network down"));

    renderWithProviders(
      <RecipeGrid
        params={{}}
        from="/recipes"
        activeFilterCount={0}
        onClearFilters={vi.fn()}
      />,
    );

    await waitFor(() =>
      expect(screen.getByText("Something went wrong")).toBeInTheDocument(),
    );
    expect(mockListRecipes).toHaveBeenCalledTimes(1);

    mockListRecipes.mockResolvedValue({
      recipes: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    });

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => expect(mockListRecipes).toHaveBeenCalledTimes(2));
  });

  it("suppresses the star for a recipe matched via a single selected category", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    mockListRecipes.mockResolvedValue({
      recipes: [
        buildRecipeCard({ tier: "best", matchedCategoryCount: 1, score: 1 }),
      ],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });

    renderWithProviders(
      <RecipeGrid
        params={{ categoryIds: ["c1"] }}
        from="/recipes"
        activeFilterCount={1}
        onClearFilters={vi.fn()}
      />,
    );

    await waitFor(() =>
      expect(screen.getByText("BBQ Pulled Pork")).toBeInTheDocument(),
    );

    expect(screen.queryByText("Best Match")).not.toBeInTheDocument();
    expect(screen.getByText("1 category matched")).toBeInTheDocument();
  });

  it("shows the star for a recipe matched via two selected categories", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    mockListRecipes.mockResolvedValue({
      recipes: [
        buildRecipeCard({ tier: "best", matchedCategoryCount: 2, score: 1 }),
      ],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });

    renderWithProviders(
      <RecipeGrid
        params={{ categoryIds: ["c1", "c2"] }}
        from="/recipes"
        activeFilterCount={2}
        onClearFilters={vi.fn()}
      />,
    );

    await waitFor(() =>
      expect(screen.getByText("Best Match")).toBeInTheDocument(),
    );
  });

  describe("entrance animation", () => {
    function grid() {
      return (
        <RecipeGrid
          params={{}}
          from="/recipes"
          activeFilterCount={0}
          onClearFilters={vi.fn()}
        />
      );
    }

    function mockOnePage() {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      mockListRecipes.mockResolvedValue({
        recipes: [buildRecipeCard()],
        page: 1,
        limit: 12,
        total: 1,
        totalPages: 1,
      });
    }

    function cardWrapper() {
      return screen.getByText("BBQ Pulled Pork").closest("div[style]");
    }

    it("animates cards in on a first load", async () => {
      mockOnePage();

      renderWithProviders(grid());

      await waitFor(() =>
        expect(screen.getByText("BBQ Pulled Pork")).toBeInTheDocument(),
      );
      expect(cardWrapper()).toHaveStyle({ opacity: "0" });
    });

    it("renders already-cached cards settled when the grid remounts", async () => {
      mockOnePage();
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const ui = (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>{grid()}</MemoryRouter>
        </QueryClientProvider>
      );

      const first = render(ui);
      await waitFor(() =>
        expect(screen.getByText("BBQ Pulled Pork")).toBeInTheDocument(),
      );
      first.unmount();

      render(ui);

      expect(screen.getByText("BBQ Pulled Pork")).toBeInTheDocument();
      expect(cardWrapper()).not.toHaveStyle({ opacity: "0" });
    });
  });
});
