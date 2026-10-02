import { deferred, setupQueryClient } from "@/test/queryClientTestUtils";
import { buildShoppingListItem } from "@/test/shoppingListFixtures";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { clearShoppingList } from "../data/api";
import { shoppingListKeys } from "../data/queryKeys";
import type { ShoppingList } from "../data/types";
import { useClearShoppingList } from "./useClearShoppingList";

vi.mock("../data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/api")>()),
  clearShoppingList: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockClear = vi.mocked(clearShoppingList);

afterEach(() => {
  vi.clearAllMocks();
});

function setup() {
  return setupQueryClient([
    [
      shoppingListKeys.list(),
      {
        items: [buildShoppingListItem({ id: "sli_1" })],
      } satisfies ShoppingList,
    ],
  ]);
}

function items(queryClient: ReturnType<typeof setup>["queryClient"]) {
  return queryClient.getQueryData<ShoppingList>(shoppingListKeys.list())?.items;
}

describe("useClearShoppingList", () => {
  it("optimistically empties the list before the request resolves", async () => {
    const { queryClient, wrapper } = setup();
    const request = deferred<{ message: string }>();
    mockClear.mockReturnValue(request.promise);

    const { result } = renderHook(() => useClearShoppingList(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(items(queryClient)).toEqual([]));
    expect(mockClear).toHaveBeenCalled();
    request.resolve({ message: "ok" });
  });

  it("restores the list when the request fails", async () => {
    const { queryClient, wrapper } = setup();
    const request = deferred<{ message: string }>();
    mockClear.mockReturnValue(request.promise);

    const { result } = renderHook(() => useClearShoppingList(), { wrapper });
    result.current.mutate();
    await waitFor(() => expect(items(queryClient)).toEqual([]));

    request.reject(new Error("network error"));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(items(queryClient)).toHaveLength(1);
  });

  it("refetches the list once the clear has saved", async () => {
    const { queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    mockClear.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useClearShoppingList(), { wrapper });
    result.current.mutate();

    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: shoppingListKeys.list(),
      }),
    );
  });

  // e.g. the session ended mid-request and endSession removed every cache.
  it("doesn't bring the list back if it was wiped while the request was in flight", async () => {
    const { queryClient, wrapper } = setup();
    mockClear.mockImplementation(() => {
      queryClient.removeQueries({ queryKey: shoppingListKeys.list() });
      return Promise.reject(new Error("session expired"));
    });

    const { result } = renderHook(() => useClearShoppingList(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(shoppingListKeys.list())).toBeUndefined();
  });
});
