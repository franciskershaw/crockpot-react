import { useAuth } from "@/features/auth/components/AuthContext";
import { listRecipes } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import type { RecipeListResponse } from "@/features/recipes/data/types";
import { buildUser } from "@/test/authFixtures";
import { setupQueryClient } from "@/test/queryClientTestUtils";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePendingRecipes } from "./usePendingRecipes";

vi.mock("@/features/recipes/data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/recipes/data/api")>()),
  listRecipes: vi.fn(),
}));
vi.mock("@/features/auth/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockListRecipes = vi.mocked(listRecipes);

const PAGE: RecipeListResponse = {
  recipes: [buildRecipeCard({ id: "r_pending" })],
  page: 1,
  limit: 12,
  total: 1,
  totalPages: 1,
};

function signInAs(role: "ADMIN" | "FREE") {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: true,
    user: buildUser({ role }),
  } as ReturnType<typeof useAuth>);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("usePendingRecipes", () => {
  it("lists pending recipes 12 at a time for an admin, cached with the other recipe lists", async () => {
    signInAs("ADMIN");
    mockListRecipes.mockResolvedValue(PAGE);
    const { queryClient, wrapper } = setupQueryClient();

    const { result } = renderHook(() => usePendingRecipes(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockListRecipes).toHaveBeenCalledWith({
      approved: false,
      limit: 12,
      page: 1,
    });
    expect(
      queryClient.getQueryData(recipeKeys.list({ approved: false, limit: 12 })),
    ).toBeDefined();
  });

  it("doesn't fetch for anyone who isn't an admin", () => {
    signInAs("FREE");
    const { wrapper } = setupQueryClient();

    renderHook(() => usePendingRecipes(), { wrapper });

    expect(mockListRecipes).not.toHaveBeenCalled();
  });
});
