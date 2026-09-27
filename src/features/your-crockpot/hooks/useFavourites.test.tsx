import { useAuth } from "@/features/auth/components/AuthContext";
import { getFavourites, removeFavourite } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import type { RecipeListResponse } from "@/features/recipes/data/types";
import { useToggleFavourite } from "@/features/recipes/hooks/useToggleFavourite";
import { deferred, setupQueryClient } from "@/test/queryClientTestUtils";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useFavourites } from "./useFavourites";

vi.mock("@/features/recipes/data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/recipes/data/api")>()),
  getFavourites: vi.fn(),
  removeFavourite: vi.fn(),
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

describe("useFavourites loadMore", () => {
  function renderWithToggle() {
    const { queryClient, wrapper } = setupQueryClient();
    const hook = renderHook(
      () => ({ favourites: useFavourites(), toggle: useToggleFavourite() }),
      { wrapper },
    );
    return { queryClient, ...hook };
  }

  it("fetches the next page when the list is fresh", async () => {
    mockGetFavourites.mockResolvedValue(page(1, 2));
    const { result } = renderWithToggle();
    await waitFor(() =>
      expect(result.current.favourites.hasNextPage).toBe(true),
    );
    mockGetFavourites.mockResolvedValue(page(2, 2));

    act(() => result.current.favourites.loadMore());

    await waitFor(() =>
      expect(mockGetFavourites).toHaveBeenLastCalledWith(2, 12),
    );
  });

  it("refetches the loaded pages instead when the list is stale", async () => {
    mockGetFavourites.mockResolvedValue(page(1, 2));
    const { queryClient, result } = renderWithToggle();
    await waitFor(() =>
      expect(result.current.favourites.hasNextPage).toBe(true),
    );
    await act(() =>
      queryClient.invalidateQueries({
        queryKey: recipeKeys.favourites(),
        refetchType: "none",
      }),
    );
    mockGetFavourites.mockClear();

    act(() => result.current.favourites.loadMore());

    await waitFor(() => expect(mockGetFavourites).toHaveBeenCalledTimes(1));
    expect(mockGetFavourites).toHaveBeenCalledWith(1, 12);
  });

  it("holds off while a favourite change is in flight", async () => {
    mockGetFavourites.mockResolvedValue(page(1, 2));
    const remove = deferred<{ message: string }>();
    vi.mocked(removeFavourite).mockReturnValue(remove.promise);
    const { queryClient, result } = renderWithToggle();
    await waitFor(() =>
      expect(result.current.favourites.hasNextPage).toBe(true),
    );
    act(() =>
      result.current.toggle.mutate({ recipeId: "r_1", wasFavourite: true }),
    );
    await waitFor(() =>
      expect(
        queryClient.isMutating({ mutationKey: recipeKeys.favouriteChange() }),
      ).toBe(1),
    );
    mockGetFavourites.mockClear();

    act(() => result.current.favourites.loadMore());

    expect(mockGetFavourites).not.toHaveBeenCalled();
    remove.resolve({ message: "ok" });
  });
});
