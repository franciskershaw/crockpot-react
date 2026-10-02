import { createRecipe } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import type { RecipeWriteInput } from "@/features/recipes/data/types";
import { ApiError } from "@/lib/http/client";
import { setupQueryClient } from "@/test/queryClientTestUtils";
import { buildRecipeDetail } from "@/test/recipeFixtures";
import { renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useCreateRecipe } from "./useCreateRecipe";

vi.mock("@/features/recipes/data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/recipes/data/api")>()),
  createRecipe: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockCreateRecipe = vi.mocked(createRecipe);

const input: RecipeWriteInput = {
  name: "Beef stew",
  description: null,
  timeInMinutes: 30,
  serves: 4,
  instructions: ["Brown the beef."],
  notes: [],
  categoryIds: ["c_dinner"],
  ingredients: [{ itemId: "i_beef", unitId: null, quantity: 1 }],
  image: null,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("useCreateRecipe", () => {
  it("seeds the new recipe's detail and marks recipe lists stale", async () => {
    const { queryClient, wrapper } = setupQueryClient([
      [recipeKeys.list({ mine: true }), { pages: [], pageParams: [] }],
    ]);
    const created = buildRecipeDetail({ id: "r_new", name: "Beef stew" });
    mockCreateRecipe.mockResolvedValue(created);

    const { result } = renderHook(() => useCreateRecipe(), { wrapper });
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreateRecipe).toHaveBeenCalledWith(input);
    expect(queryClient.getQueryData(recipeKeys.detail("r_new"))).toEqual(
      created,
    );
    expect(
      queryClient.getQueryState(recipeKeys.list({ mine: true }))?.isInvalidated,
    ).toBe(true);
  });

  it.each([
    [400, "invalid_item_id"],
    [409, "recipe_limit_reached"],
  ])(
    "leaves a %i for the form's footer instead of toasting it",
    async (status, code) => {
      const { wrapper } = setupQueryClient();
      mockCreateRecipe.mockRejectedValue(new ApiError(status, code));

      const { result } = renderHook(() => useCreateRecipe(), { wrapper });
      result.current.mutate(input);

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).not.toHaveBeenCalled();
    },
  );
});
