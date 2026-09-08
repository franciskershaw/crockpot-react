import { useAuth } from "@/features/auth/components/AuthContext";
import { renderWithProviders } from "@/test/renderWithProviders";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { listRecipes } from "../api";
import type { RecipeCard as RecipeCardData } from "../types";
import { RecipeGrid } from "./RecipeGrid";

vi.mock("../api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api")>()),
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

describe("RecipeGrid", () => {
  it("shows a retry affordance when the list fails to load, and refetches on click", async () => {
    mockListRecipes.mockRejectedValue(new Error("network down"));

    renderWithProviders(
      <RecipeGrid params={{}} activeFilterCount={0} onClearFilters={vi.fn()} />,
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
      recipes: [recipe({ tier: "best", matchedCategoryCount: 1, score: 1 })],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });

    renderWithProviders(
      <RecipeGrid
        params={{ categoryIds: ["c1"] }}
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
      recipes: [recipe({ tier: "best", matchedCategoryCount: 2, score: 1 })],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });

    renderWithProviders(
      <RecipeGrid
        params={{ categoryIds: ["c1", "c2"] }}
        activeFilterCount={2}
        onClearFilters={vi.fn()}
      />,
    );

    await waitFor(() =>
      expect(screen.getByText("Best Match")).toBeInTheDocument(),
    );
  });
});
