import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { listRecipes } from "./api";
import type { RecipeListResponse } from "./types";
import { useRecipeList } from "./useRecipeList";

vi.mock("./api", () => ({
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
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useRecipeList", () => {
  it("fetches page 1 first", async () => {
    mockListRecipes.mockResolvedValue(response({ page: 1, totalPages: 3 }));

    renderHook(() => useRecipeList({}), { wrapper: wrapper() });

    await waitFor(() =>
      expect(mockListRecipes).toHaveBeenCalledWith({ page: 1 }),
    );
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
});
