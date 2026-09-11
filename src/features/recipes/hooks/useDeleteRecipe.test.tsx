import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { deleteRecipe } from "../api";
import { recipeKeys } from "../queryKeys";
import type { RecipeCard, RecipeDetail, RecipeListResponse } from "../types";
import { useDeleteRecipe } from "./useDeleteRecipe";

vi.mock("../api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api")>()),
  deleteRecipe: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockDeleteRecipe = vi.mocked(deleteRecipe);

afterEach(() => {
  vi.clearAllMocks();
});

function recipe(overrides: Partial<RecipeCard> = {}): RecipeCard {
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

function recipeDetail(overrides: Partial<RecipeDetail> = {}): RecipeDetail {
  return {
    ...recipe(),
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

function page(recipes: RecipeCard[]): RecipeListResponse {
  return { recipes, page: 1, limit: 20, total: recipes.length, totalPages: 1 };
}

function setup(recipes: RecipeCard[]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const queryKey = recipeKeys.list({});
  queryClient.setQueryData(queryKey, {
    pages: [page(recipes)],
    pageParams: [1],
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, queryKey, wrapper };
}

describe("useDeleteRecipe", () => {
  it("calls deleteRecipe with the given recipe id", async () => {
    const { wrapper } = setup([]);
    mockDeleteRecipe.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteRecipe(), { wrapper });
    result.current.mutate("r_1");

    await waitFor(() => expect(mockDeleteRecipe).toHaveBeenCalledWith("r_1"));
  });

  it("evicts the deleted recipe from cached list pages on success", async () => {
    const { queryClient, queryKey, wrapper } = setup([
      recipe({ id: "r_1" }),
      recipe({ id: "r_2" }),
    ]);
    mockDeleteRecipe.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteRecipe(), { wrapper });
    result.current.mutate("r_1");

    await waitFor(() => {
      const data = queryClient.getQueryData<{
        pages: RecipeListResponse[];
      }>(queryKey);
      expect(data?.pages[0].recipes.map((recipe) => recipe.id)).not.toContain(
        "r_1",
      );
    });

    const data = queryClient.getQueryData<{ pages: RecipeListResponse[] }>(
      queryKey,
    );
    expect(data?.pages[0].recipes.map((recipe) => recipe.id)).toEqual(["r_2"]);
  });

  it("removes the recipe's own detail cache entry on success", async () => {
    const { queryClient, wrapper } = setup([]);
    const detailKey = recipeKeys.detail("r_1");
    queryClient.setQueryData(detailKey, recipeDetail({ id: "r_1" }));
    mockDeleteRecipe.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteRecipe(), { wrapper });
    result.current.mutate("r_1");

    await waitFor(() =>
      expect(queryClient.getQueryData(detailKey)).toBeUndefined(),
    );
  });

  it("leaves cached list pages untouched while the request is pending", async () => {
    const { queryClient, queryKey, wrapper } = setup([recipe({ id: "r_1" })]);
    let resolveDelete: () => void;
    mockDeleteRecipe.mockReturnValue(
      new Promise((resolve) => {
        resolveDelete = () => resolve(undefined);
      }),
    );

    const { result } = renderHook(() => useDeleteRecipe(), { wrapper });
    result.current.mutate("r_1");

    await waitFor(() => expect(mockDeleteRecipe).toHaveBeenCalled());
    const data = queryClient.getQueryData<{ pages: RecipeListResponse[] }>(
      queryKey,
    );
    expect(data?.pages[0].recipes.map((recipe) => recipe.id)).toEqual(["r_1"]);

    resolveDelete!();
  });
});
