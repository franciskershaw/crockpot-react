import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { listRecipes } from "./api";
import type { RecipeListResponse } from "./types";
import { useRecipeList } from "./useRecipeList";

vi.mock("./api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api")>()),
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
