import { setupQueryClient } from "@/test/queryClientTestUtils";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { regenerateShoppingList } from "../data/api";
import { shoppingListKeys } from "../data/queryKeys";
import { useRegenerateShoppingList } from "./useRegenerateShoppingList";

vi.mock("../data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/api")>()),
  regenerateShoppingList: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockRegenerate = vi.mocked(regenerateShoppingList);

afterEach(() => {
  vi.clearAllMocks();
});

describe("useRegenerateShoppingList", () => {
  it("calls regenerate and marks the list stale once it succeeds", async () => {
    const { queryClient, wrapper } = setupQueryClient([
      [shoppingListKeys.list(), { items: [] }],
    ]);
    mockRegenerate.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useRegenerateShoppingList(), {
      wrapper,
    });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockRegenerate).toHaveBeenCalled();
    expect(
      queryClient.getQueryState(shoppingListKeys.list())?.isInvalidated,
    ).toBe(true);
  });
});
