import { menuKeys } from "@/features/menu/data/queryKeys";
import { updateRecipe } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import type { RecipeWriteInput } from "@/features/recipes/data/types";
import { shoppingListKeys } from "@/features/shopping-list/data/queryKeys";
import { ApiError } from "@/lib/http/client";
import { setupQueryClient } from "@/test/queryClientTestUtils";
import { buildRecipeDetail } from "@/test/recipeFixtures";
import { renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useUpdateRecipe } from "./useUpdateRecipe";

vi.mock("@/features/recipes/data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/recipes/data/api")>()),
  updateRecipe: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockUpdateRecipe = vi.mocked(updateRecipe);

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

describe("useUpdateRecipe", () => {
  it("replaces the cached detail and marks lists, favourites, menu and shopping list stale", async () => {
    const stale = [
      recipeKeys.list({ mine: true }),
      recipeKeys.favourites(),
      menuKeys.menu(),
      shoppingListKeys.list(),
    ];
    const { queryClient, wrapper } = setupQueryClient([
      [recipeKeys.detail("r_1"), buildRecipeDetail({ id: "r_1" })],
      ...stale.map((key) => [key, {}] as [readonly unknown[], unknown]),
    ]);
    const updated = buildRecipeDetail({ id: "r_1", name: "Beef stew" });
    mockUpdateRecipe.mockResolvedValue(updated);

    const { result } = renderHook(() => useUpdateRecipe("r_1"), { wrapper });
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockUpdateRecipe).toHaveBeenCalledWith("r_1", input);
    expect(queryClient.getQueryData(recipeKeys.detail("r_1"))).toEqual(updated);
    for (const key of stale) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
    }
  });

  it("leaves a 400 for the form's footer instead of toasting it", async () => {
    const { wrapper } = setupQueryClient();
    mockUpdateRecipe.mockRejectedValue(new ApiError(400, "invalid_item_id"));

    const { result } = renderHook(() => useUpdateRecipe("r_1"), { wrapper });
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).not.toHaveBeenCalled();
  });
});
