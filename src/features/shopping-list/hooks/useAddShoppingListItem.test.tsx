import { setupQueryClient } from "@/test/queryClientTestUtils";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { addShoppingListItem } from "../data/api";
import { shoppingListKeys } from "../data/queryKeys";
import { useAddShoppingListItem } from "./useAddShoppingListItem";

vi.mock("../data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/api")>()),
  addShoppingListItem: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockAdd = vi.mocked(addShoppingListItem);

afterEach(() => {
  vi.clearAllMocks();
});

describe("useAddShoppingListItem", () => {
  it("sends the item and marks the list stale once the add succeeds", async () => {
    const { queryClient, wrapper } = setupQueryClient([
      [shoppingListKeys.list(), { items: [] }],
    ]);
    mockAdd.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useAddShoppingListItem(), { wrapper });
    result.current.mutate({ itemId: "i_9", quantity: 3, unitId: "u_1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAdd).toHaveBeenCalledWith("i_9", 3, "u_1");
    expect(
      queryClient.getQueryState(shoppingListKeys.list())?.isInvalidated,
    ).toBe(true);
  });
});
