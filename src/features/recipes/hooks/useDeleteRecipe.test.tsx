import type { ReactNode } from "react";
import { buildRecipeCard, buildRecipeDetail } from "@/test/recipeFixtures";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { deleteRecipe } from "../data/api";
import { recipeKeys } from "../data/queryKeys";
import type { RecipeCard, RecipeListResponse } from "../data/types";
import { useDeleteRecipe } from "./useDeleteRecipe";

vi.mock("../data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/api")>()),
  deleteRecipe: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockDeleteRecipe = vi.mocked(deleteRecipe);

afterEach(() => {
  vi.clearAllMocks();
});

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
      buildRecipeCard({ id: "r_1" }),
      buildRecipeCard({ id: "r_2" }),
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
    queryClient.setQueryData(detailKey, buildRecipeDetail({ id: "r_1" }));
    mockDeleteRecipe.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteRecipe(), { wrapper });
    result.current.mutate("r_1");

    await waitFor(() =>
      expect(queryClient.getQueryData(detailKey)).toBeUndefined(),
    );
  });

  it("leaves cached list pages untouched while the request is pending", async () => {
    const { queryClient, queryKey, wrapper } = setup([
      buildRecipeCard({ id: "r_1" }),
    ]);
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
