import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { addFavourite, removeFavourite } from "../api";
import { recipeKeys } from "../queryKeys";
import type { RecipeCard, RecipeListResponse } from "../types";
import { useToggleFavourite } from "./useToggleFavourite";

vi.mock("../api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api")>()),
  addFavourite: vi.fn(),
  removeFavourite: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockAddFavourite = vi.mocked(addFavourite);
const mockRemoveFavourite = vi.mocked(removeFavourite);

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

describe("useToggleFavourite", () => {
  it("optimistically flips isFavourite in the list cache before the request resolves", async () => {
    const { queryClient, queryKey, wrapper } = setup([
      recipe({ id: "r_1", isFavourite: false }),
    ]);
    let resolveAdd: (v: { message: string }) => void;
    mockAddFavourite.mockReturnValue(
      new Promise((resolve) => {
        resolveAdd = resolve;
      }),
    );

    const { result } = renderHook(() => useToggleFavourite(), { wrapper });

    result.current.mutate({ recipeId: "r_1", wasFavourite: false });

    await waitFor(() => {
      const data = queryClient.getQueryData<{
        pages: RecipeListResponse[];
      }>(queryKey);
      expect(data?.pages[0].recipes[0].isFavourite).toBe(true);
    });

    expect(mockAddFavourite).toHaveBeenCalledWith("r_1");
    resolveAdd!({ message: "ok" });
  });

  it("calls removeFavourite when the recipe was already favourited", async () => {
    const { wrapper } = setup([recipe({ id: "r_1", isFavourite: true })]);
    mockRemoveFavourite.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useToggleFavourite(), { wrapper });

    result.current.mutate({ recipeId: "r_1", wasFavourite: true });

    await waitFor(() =>
      expect(mockRemoveFavourite).toHaveBeenCalledWith("r_1"),
    );
  });

  it("rolls back the optimistic flip when the request fails", async () => {
    const { queryClient, queryKey, wrapper } = setup([
      recipe({ id: "r_1", isFavourite: false }),
    ]);
    mockAddFavourite.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useToggleFavourite(), { wrapper });

    result.current.mutate({ recipeId: "r_1", wasFavourite: false });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const data = queryClient.getQueryData<{ pages: RecipeListResponse[] }>(
      queryKey,
    );
    expect(data?.pages[0].recipes[0].isFavourite).toBe(false);
  });
});
