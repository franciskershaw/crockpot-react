import { deferred, setupQueryClient } from "@/test/queryClientTestUtils";
import { buildShoppingListItem } from "@/test/shoppingListFixtures";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { deleteShoppingListItem } from "../data/api";
import { shoppingListKeys } from "../data/queryKeys";
import type { ShoppingList } from "../data/types";
import { useDeleteShoppingListItem } from "./useDeleteShoppingListItem";

vi.mock("../data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/api")>()),
  deleteShoppingListItem: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockDelete = vi.mocked(deleteShoppingListItem);

afterEach(() => {
  vi.clearAllMocks();
});

function setup() {
  return setupQueryClient([
    [
      shoppingListKeys.list(),
      {
        items: [
          buildShoppingListItem({ id: "sli_1" }),
          buildShoppingListItem({ id: "sli_2", itemName: "Garlic" }),
        ],
      } satisfies ShoppingList,
    ],
  ]);
}

function ids(queryClient: ReturnType<typeof setup>["queryClient"]) {
  return queryClient
    .getQueryData<ShoppingList>(shoppingListKeys.list())
    ?.items.map((item) => item.id);
}

describe("useDeleteShoppingListItem", () => {
  it("optimistically removes the row before the request resolves", async () => {
    const { queryClient, wrapper } = setup();
    const request = deferred<{ message: string }>();
    mockDelete.mockReturnValue(request.promise);

    const { result } = renderHook(() => useDeleteShoppingListItem(), {
      wrapper,
    });
    result.current.mutate({ id: "sli_1" });

    await waitFor(() => expect(ids(queryClient)).toEqual(["sli_2"]));
    expect(mockDelete).toHaveBeenCalledWith("sli_1");
    request.resolve({ message: "ok" });
  });

  it("restores the row when the request fails", async () => {
    const { queryClient, wrapper } = setup();
    const request = deferred<{ message: string }>();
    mockDelete.mockReturnValue(request.promise);

    const { result } = renderHook(() => useDeleteShoppingListItem(), {
      wrapper,
    });
    result.current.mutate({ id: "sli_1" });
    await waitFor(() => expect(ids(queryClient)).toEqual(["sli_2"]));

    request.reject(new Error("network error"));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(ids(queryClient)).toEqual(["sli_1", "sli_2"]);
  });

  it("refetches the list once the delete has saved", async () => {
    const { queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    mockDelete.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useDeleteShoppingListItem(), {
      wrapper,
    });
    result.current.mutate({ id: "sli_1" });

    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: shoppingListKeys.list(),
      }),
    );
  });

  // e.g. the session ended mid-request and endSession removed every cache.
  it("doesn't bring the list back if it was wiped while the request was in flight", async () => {
    const { queryClient, wrapper } = setup();
    mockDelete.mockImplementation(() => {
      queryClient.removeQueries({ queryKey: shoppingListKeys.list() });
      return Promise.reject(new Error("session expired"));
    });

    const { result } = renderHook(() => useDeleteShoppingListItem(), {
      wrapper,
    });
    result.current.mutate({ id: "sli_1" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(shoppingListKeys.list())).toBeUndefined();
  });
});
