import { menuKeys } from "@/features/menu/data/queryKeys";
import type { Menu } from "@/features/menu/data/types";
import { shoppingListKeys } from "@/features/shopping-list/data/queryKeys";
import { setupQueryClient } from "@/test/queryClientTestUtils";
import { buildRecipeCard, buildRecipeDetail } from "@/test/recipeFixtures";
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
  const queryKey = recipeKeys.list({});
  const { queryClient, wrapper } = setupQueryClient([
    [queryKey, { pages: [page(recipes)], pageParams: [1] }],
  ]);

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

  it("takes the deleted recipe off the cached menu, since the server cascades it", async () => {
    const { queryClient, wrapper } = setup([]);
    queryClient.setQueryData<Menu>(menuKeys.menu(), {
      entries: [
        { recipeId: "r_1", serves: 4, recipe: buildRecipeCard({ id: "r_1" }) },
        { recipeId: "r_2", serves: 2, recipe: buildRecipeCard({ id: "r_2" }) },
      ],
    });
    mockDeleteRecipe.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteRecipe(), { wrapper });
    result.current.mutate("r_1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      queryClient
        .getQueryData<Menu>(menuKeys.menu())
        ?.entries.map((entry) => entry.recipeId),
    ).toEqual(["r_2"]);
  });

  it("marks the shopping list stale on success", async () => {
    const { queryClient, wrapper } = setup([]);
    queryClient.setQueryData(shoppingListKeys.list(), { items: [] });
    mockDeleteRecipe.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteRecipe(), { wrapper });
    result.current.mutate("r_1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      queryClient.getQueryState(shoppingListKeys.list())?.isInvalidated,
    ).toBe(true);
  });

  it("counts the deleted recipe off every cached page's total", async () => {
    const queryKey = recipeKeys.list({ mine: true });
    const { queryClient, wrapper } = setupQueryClient([
      [
        queryKey,
        {
          pages: [
            { ...page([buildRecipeCard({ id: "r_1" })]), total: 13 },
            { ...page([buildRecipeCard({ id: "r_2" })]), page: 2, total: 13 },
          ],
          pageParams: [1, 2],
        },
      ],
    ]);
    mockDeleteRecipe.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteRecipe(), { wrapper });
    result.current.mutate("r_1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const data = queryClient.getQueryData<{ pages: RecipeListResponse[] }>(
      queryKey,
    );
    expect(data?.pages.map((p) => p.total)).toEqual([12, 12]);
  });

  it("leaves a list's total alone when the recipe wasn't in it", async () => {
    const { queryClient, queryKey, wrapper } = setup([
      buildRecipeCard({ id: "r_2" }),
    ]);
    mockDeleteRecipe.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteRecipe(), { wrapper });
    result.current.mutate("r_1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const data = queryClient.getQueryData<{ pages: RecipeListResponse[] }>(
      queryKey,
    );
    expect(data?.pages[0].total).toBe(1);
  });

  it("marks cached lists stale, since the server's pages have shifted", async () => {
    const { queryClient, queryKey, wrapper } = setup([
      buildRecipeCard({ id: "r_1" }),
    ]);
    mockDeleteRecipe.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteRecipe(), { wrapper });
    result.current.mutate("r_1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
  });

  it("takes the deleted recipe off cached favourites, counting it off and marking them stale", async () => {
    const { queryClient, wrapper } = setup([]);
    queryClient.setQueryData(recipeKeys.favourites(), {
      pages: [
        page([
          buildRecipeCard({ id: "r_1", isFavourite: true }),
          buildRecipeCard({ id: "r_2", isFavourite: true }),
        ]),
      ],
      pageParams: [1],
    });
    mockDeleteRecipe.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteRecipe(), { wrapper });
    result.current.mutate("r_1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const data = queryClient.getQueryData<{ pages: RecipeListResponse[] }>(
      recipeKeys.favourites(),
    );
    expect(data?.pages[0].recipes.map((recipe) => recipe.id)).toEqual(["r_2"]);
    expect(data?.pages[0].total).toBe(1);
    expect(
      queryClient.getQueryState(recipeKeys.favourites())?.isInvalidated,
    ).toBe(true);
  });
});
