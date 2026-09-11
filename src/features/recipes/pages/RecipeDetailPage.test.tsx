import { renderWithProviders } from "@/test/renderWithProviders";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getRecipe } from "../api";
import type { RecipeDetail } from "../types";
import { RecipeDetailPage } from "./RecipeDetailPage";

vi.mock("../api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api")>()),
  getRecipe: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockGetRecipe = vi.mocked(getRecipe);

afterEach(() => {
  vi.clearAllMocks();
});

function recipeDetail(overrides: Partial<RecipeDetail> = {}): RecipeDetail {
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
    description: null,
    instructions: [],
    notes: [],
    ingredients: [],
    createdById: "u_1",
    createdByName: "Jamie",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("RecipeDetailPage", () => {
  it("renders the recipe once it loads", async () => {
    mockGetRecipe.mockResolvedValue(recipeDetail({ name: "BBQ Pulled Pork" }));

    renderWithProviders(<RecipeDetailPage recipeId="r_1" />);

    expect(await screen.findByText("BBQ Pulled Pork")).toBeInTheDocument();
    expect(mockGetRecipe).toHaveBeenCalledWith("r_1");
  });

  it("renders a back-to-recipes control once loaded", async () => {
    mockGetRecipe.mockResolvedValue(recipeDetail());

    renderWithProviders(<RecipeDetailPage recipeId="r_1" />);

    expect(
      (await screen.findAllByRole("link", { name: /back to recipes/i })).length,
    ).toBeGreaterThan(0);
  });

  it("shows a not-found panel for a 404, with a link back to recipes", async () => {
    const { ApiError } = await import("@/lib/http/client");
    mockGetRecipe.mockRejectedValue(new ApiError(404, "not_found"));

    renderWithProviders(<RecipeDetailPage recipeId="missing" />);

    expect(await screen.findByText("Recipe not found")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to recipes/i }),
    ).toHaveAttribute("href", "/recipes");
  });

  it("shows a generic error panel with retry for a non-404 failure", async () => {
    const { ApiError } = await import("@/lib/http/client");
    mockGetRecipe.mockRejectedValue(new ApiError(500, "server_error"));

    renderWithProviders(<RecipeDetailPage recipeId="r_1" />);

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();

    mockGetRecipe.mockResolvedValue(recipeDetail());
    await userEvent.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => expect(mockGetRecipe).toHaveBeenCalledTimes(2));
  });
});
