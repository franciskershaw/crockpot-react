import { useAuth } from "@/features/auth/components/AuthContext";
import { listRecipes } from "@/features/recipes/data/api";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { renderWithProviders } from "@/test/renderWithProviders";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

  describe("infinite scroll", () => {
    // Like the real observer, only reports when told to — a dropped event is
    // not repeated while the sentinel stays in view.
    class FakeIntersectionObserver {
      static instances: FakeIntersectionObserver[] = [];
      callback: IntersectionObserverCallback;
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
        FakeIntersectionObserver.instances.push(this);
      }
      observe = vi.fn();
      unobserve = vi.fn();
      takeRecords = () => [];
      disconnect = () => {
        FakeIntersectionObserver.instances =
          FakeIntersectionObserver.instances.filter((i) => i !== this);
      };
      static setSentinelInView(isIntersecting: boolean) {
        act(() => {
          for (const instance of FakeIntersectionObserver.instances) {
            instance.callback(
              [{ isIntersecting } as IntersectionObserverEntry],
              instance as unknown as IntersectionObserver,
            );
          }
        });
      }
    }

    function pageResponse(page: number) {
      return {
        recipes: [buildRecipeCard({ id: `r_${page}`, name: `Recipe ${page}` })],
        page,
        limit: 12,
        total: 3,
        totalPages: 3,
      };
    }

    function pagesRequested() {
      return mockListRecipes.mock.calls.map(([params]) => params?.page);
    }

    beforeEach(() => {
      FakeIntersectionObserver.instances = [];
      vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      mockListRecipes.mockImplementation(async (params) =>
        pageResponse(params?.page ?? 1),
      );
      renderWithProviders(
        <RecipeGrid
          params={{}}
          from="/recipes"
          activeFilterCount={0}
          onClearFilters={vi.fn()}
        />,
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("fetches the next page when the sentinel is back in view right after a fetch settles", async () => {
      await screen.findByText("Recipe 1");

      FakeIntersectionObserver.setSentinelInView(true);
      await screen.findByText("Recipe 2");
      FakeIntersectionObserver.setSentinelInView(false);
      FakeIntersectionObserver.setSentinelInView(true);

      await waitFor(() => expect(pagesRequested()).toEqual([1, 2, 3]));
    });

    it("requests a page once when the sentinel re-enters view mid-fetch", async () => {
      let resolvePage2!: () => void;
      mockListRecipes.mockImplementation((params) =>
        params?.page === 2
          ? new Promise((resolve) => {
              resolvePage2 = () => resolve(pageResponse(2));
            })
          : Promise.resolve(pageResponse(params?.page ?? 1)),
      );
      await screen.findByText("Recipe 1");

      FakeIntersectionObserver.setSentinelInView(true);
      await waitFor(() => expect(pagesRequested()).toEqual([1, 2]));
      FakeIntersectionObserver.setSentinelInView(false);
      FakeIntersectionObserver.setSentinelInView(true);
      act(() => resolvePage2());
      await screen.findByText("Recipe 2");

      expect(pagesRequested().filter((page) => page === 2)).toHaveLength(1);
    });

    it("does not retry a failed page fetch while the sentinel stays in view", async () => {
      mockListRecipes.mockImplementation(async (params) => {
        if (params?.page === 2) throw new Error("network down");
        return pageResponse(params?.page ?? 1);
      });
      await screen.findByText("Recipe 1");

      FakeIntersectionObserver.setSentinelInView(true);
      await screen.findByText("Something went wrong");

      expect(pagesRequested()).toEqual([1, 2]);
    });
  });
});
