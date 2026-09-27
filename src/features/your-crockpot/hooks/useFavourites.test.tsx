import { useAuth } from "@/features/auth/components/AuthContext";
import { getFavourites } from "@/features/recipes/data/api";
import type { RecipeListResponse } from "@/features/recipes/data/types";
import { setupQueryClient } from "@/test/queryClientTestUtils";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useFavourites } from "./useFavourites";

vi.mock("@/features/recipes/data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/recipes/data/api")>()),
  getFavourites: vi.fn(),
}));
vi.mock("@/features/auth/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockGetFavourites = vi.mocked(getFavourites);
const mockUseAuth = vi.mocked(useAuth);

function page(pageNumber: number, totalPages: number): RecipeListResponse {
  return {
    recipes: [buildRecipeCard({ id: `r_${pageNumber}`, isFavourite: true })],
    page: pageNumber,
    limit: 12,
    total: totalPages,
    totalPages,
  };
}

function renderFavourites() {
  const { wrapper } = setupQueryClient();
  return renderHook(() => useFavourites(), { wrapper });
}

beforeEach(() => {
  mockUseAuth.mockReturnValue({ isAuthenticated: true } as ReturnType<
    typeof useAuth
  >);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useFavourites", () => {
  it("requests the first page with a page size of 12", async () => {
    mockGetFavourites.mockResolvedValue(page(1, 1));

    const { result } = renderFavourites();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetFavourites).toHaveBeenCalledWith(1, 12);
  });

  it("fetches the next page while more pages exist", async () => {
    mockGetFavourites
      .mockResolvedValueOnce(page(1, 2))
      .mockResolvedValueOnce(page(2, 2));

    const { result } = renderFavourites();
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));

    await result.current.fetchNextPage();

    expect(mockGetFavourites).toHaveBeenLastCalledWith(2, 12);
  });

  it("reports no next page once the last page has loaded", async () => {
    mockGetFavourites.mockResolvedValue(page(1, 1));

    const { result } = renderFavourites();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it("doesn't fetch while logged out", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false } as ReturnType<
      typeof useAuth
    >);
    mockGetFavourites.mockResolvedValue(page(1, 1));

    const { result } = renderFavourites();

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(mockGetFavourites).not.toHaveBeenCalled();
  });
});
