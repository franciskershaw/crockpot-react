import { listRecipes } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import type { RecipeListResponse } from "@/features/recipes/data/types";
import { setupQueryClient } from "@/test/queryClientTestUtils";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useRecipeList } from "./useRecipeList";

vi.mock("@/features/recipes/data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/recipes/data/api")>()),
  listRecipes: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockListRecipes = vi.mocked(listRecipes);

afterEach(() => {
  vi.clearAllMocks();
});

function response(
  overrides: Partial<RecipeListResponse> = {},
): RecipeListResponse {
  return {
    recipes: [],
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    ...overrides,
  };
}

function wrapper() {
  return setupQueryClient().wrapper;
}

describe("useRecipeList", () => {
  it("fetches page 1 first, 12 recipes per page", async () => {
    mockListRecipes.mockResolvedValue(response({ page: 1, totalPages: 3 }));

    renderHook(() => useRecipeList({}), { wrapper: wrapper() });

    await waitFor(() =>
      expect(mockListRecipes).toHaveBeenCalledWith({ page: 1, limit: 12 }),
    );
  });

  it("keys the query by the full request, page size included", async () => {
    mockListRecipes.mockResolvedValue(response());
    const { queryClient, wrapper } = setupQueryClient();

    renderHook(() => useRecipeList({ q: "chicken" }), { wrapper });

    await waitFor(() =>
      expect(
        queryClient.getQueryData(recipeKeys.list({ q: "chicken", limit: 12 })),
      ).toBeDefined(),
    );
  });

  it("keeps the 12-per-page limit on later pages", async () => {
    mockListRecipes.mockResolvedValue(response({ page: 1, totalPages: 3 }));

    const { result } = renderHook(() => useRecipeList({}), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));

    await act(() => result.current.fetchNextPage());

    expect(mockListRecipes).toHaveBeenLastCalledWith({ page: 2, limit: 12 });
  });

  it("offers a next page while page < totalPages", async () => {
    mockListRecipes.mockResolvedValue(response({ page: 1, totalPages: 3 }));

    const { result } = renderHook(() => useRecipeList({}), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
  });

  it("stops paging once the last page is reached", async () => {
    mockListRecipes.mockResolvedValue(response({ page: 3, totalPages: 3 }));

    const { result } = renderHook(() => useRecipeList({}), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it("keeps the previous page's data visible while a new filter is loading", async () => {
    mockListRecipes.mockResolvedValueOnce(
      response({ page: 1, totalPages: 1, total: 42 }),
    );

    const { result, rerender } = renderHook(
      ({ params }) => useRecipeList(params),
      { wrapper: wrapper(), initialProps: { params: {} } },
    );

    await waitFor(() => expect(result.current.data?.pages[0].total).toBe(42));

    let resolveNext: (v: RecipeListResponse) => void;
    mockListRecipes.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveNext = resolve;
      }),
    );

    rerender({ params: { q: "chicken" } });

    expect(result.current.data?.pages[0].total).toBe(42);
    expect(result.current.isPlaceholderData).toBe(true);

    resolveNext!(response({ page: 1, totalPages: 1, total: 7 }));
    await waitFor(() => expect(result.current.data?.pages[0].total).toBe(7));
  });
});
