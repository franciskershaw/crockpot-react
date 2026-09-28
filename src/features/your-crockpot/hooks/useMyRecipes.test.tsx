import { useAuth } from "@/features/auth/components/AuthContext";
import { deleteRecipe, listRecipes } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import type {
  RecipeListData,
  RecipeListResponse,
} from "@/features/recipes/data/types";
import { useDeleteRecipe } from "@/features/recipes/hooks/useDeleteRecipe";
import { deferred, setupQueryClient } from "@/test/queryClientTestUtils";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useMyRecipes } from "./useMyRecipes";

vi.mock("@/features/recipes/data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/recipes/data/api")>()),
  listRecipes: vi.fn(),
  deleteRecipe: vi.fn(),
}));
vi.mock("@/features/auth/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockListRecipes = vi.mocked(listRecipes);
const mockDeleteRecipe = vi.mocked(deleteRecipe);
const mockUseAuth = vi.mocked(useAuth);

const MY_RECIPES_KEY = recipeKeys.list({ mine: true, limit: 12 });

function page(
  pageNumber: number,
  totalPages: number,
  ids = [`r_${pageNumber}`],
): RecipeListResponse {
  return {
    recipes: ids.map((id) => buildRecipeCard({ id })),
    page: pageNumber,
    limit: 12,
    total: totalPages,
    totalPages,
  };
}

function renderMyRecipes() {
  const { queryClient, wrapper } = setupQueryClient();
  const hook = renderHook(() => useMyRecipes(), { wrapper });
  return { queryClient, ...hook };
}

beforeEach(() => {
  mockUseAuth.mockReturnValue({ isAuthenticated: true } as ReturnType<
    typeof useAuth
  >);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useMyRecipes", () => {
  it("requests the first page of the caller's own recipes, 12 at a time", async () => {
    mockListRecipes.mockResolvedValue(page(1, 1));

    const { result } = renderMyRecipes();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockListRecipes).toHaveBeenCalledWith({
      mine: true,
      limit: 12,
      page: 1,
    });
  });

  it("caches under the recipe-list key for mine=true", async () => {
    mockListRecipes.mockResolvedValue(page(1, 1));

    const { queryClient, result } = renderMyRecipes();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(MY_RECIPES_KEY)).toBeDefined();
  });

  it("fetches the next page while more pages exist", async () => {
    mockListRecipes
      .mockResolvedValueOnce(page(1, 2))
      .mockResolvedValueOnce(page(2, 2));

    const { result } = renderMyRecipes();
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));

    await act(() => result.current.fetchNextPage());

    expect(mockListRecipes).toHaveBeenLastCalledWith({
      mine: true,
      limit: 12,
      page: 2,
    });
  });

  it("reports no next page once the last page has loaded", async () => {
    mockListRecipes.mockResolvedValue(page(1, 1));

    const { result } = renderMyRecipes();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it("doesn't fetch while logged out", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false } as ReturnType<
      typeof useAuth
    >);
    mockListRecipes.mockResolvedValue(page(1, 1));

    const { result } = renderMyRecipes();

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(mockListRecipes).not.toHaveBeenCalled();
  });

  it("drops a recipe deleted elsewhere from the cached list", async () => {
    mockListRecipes.mockResolvedValue(page(1, 1, ["r_1", "r_2"]));
    mockDeleteRecipe.mockResolvedValue(undefined);
    const { wrapper, queryClient } = setupQueryClient();
    const { result } = renderHook(
      () => ({ mine: useMyRecipes(), remove: useDeleteRecipe() }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.mine.isSuccess).toBe(true));

    await act(() => result.current.remove.mutateAsync("r_1"));

    const data = queryClient.getQueryData<RecipeListData>(MY_RECIPES_KEY);
    expect(data?.pages[0].recipes.map((recipe) => recipe.id)).toEqual(["r_2"]);
  });
});

describe("useMyRecipes loadMore", () => {
  it("fetches the next page", async () => {
    mockListRecipes.mockResolvedValue(page(1, 2));
    const { result } = renderMyRecipes();
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
    mockListRecipes.mockResolvedValue(page(2, 2));

    act(() => result.current.loadMore());

    await waitFor(() =>
      expect(mockListRecipes).toHaveBeenLastCalledWith({
        mine: true,
        limit: 12,
        page: 2,
      }),
    );
  });

  it("does nothing while a fetch is already running", async () => {
    mockListRecipes.mockResolvedValue(page(1, 2));
    const { result } = renderMyRecipes();
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
    const pending = deferred<RecipeListResponse>();
    mockListRecipes.mockReturnValue(pending.promise);
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.isFetching).toBe(true));

    act(() => result.current.loadMore());

    expect(mockListRecipes).toHaveBeenCalledTimes(2);
    await act(async () => pending.resolve(page(2, 2)));
  });
});
