import { deferred, setupQueryClient } from "@/test/queryClientTestUtils";
import { buildShoppingListItem } from "@/test/shoppingListFixtures";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { updateShoppingListItem } from "../data/api";
import { shoppingListKeys } from "../data/queryKeys";
import type { ShoppingList } from "../data/types";
import { useUpdateShoppingListItem } from "./useUpdateShoppingListItem";

vi.mock("../data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/api")>()),
  updateShoppingListItem: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockUpdate = vi.mocked(updateShoppingListItem);

afterEach(() => {
  vi.clearAllMocks();
});

function setup() {
  return setupQueryClient([
    [
      shoppingListKeys.list(),
      {
        items: [
          buildShoppingListItem({ id: "sli_1", quantity: 2 }),
          buildShoppingListItem({ id: "sli_2", itemName: "Garlic" }),
        ],
      } satisfies ShoppingList,
    ],
  ]);
}

function row(queryClient: ReturnType<typeof setup>["queryClient"], id: string) {
  return queryClient
    .getQueryData<ShoppingList>(shoppingListKeys.list())
    ?.items.find((item) => item.id === id);
}

describe("useUpdateShoppingListItem", () => {
  it("optimistically ticks the row before the request resolves", async () => {
    const { queryClient, wrapper } = setup();
    const request = deferred<{ message: string }>();
    mockUpdate.mockReturnValue(request.promise);

    const { result } = renderHook(() => useUpdateShoppingListItem(), {
      wrapper,
    });
    result.current.mutate({ id: "sli_1", obtained: true });

    await waitFor(() => expect(row(queryClient, "sli_1")?.obtained).toBe(true));
    expect(row(queryClient, "sli_2")?.obtained).toBe(false);
    expect(mockUpdate).toHaveBeenCalledWith("sli_1", { obtained: true });
    request.resolve({ message: "ok" });
  });

  it("optimistically edits the quantity without touching obtained", async () => {
    const { queryClient, wrapper } = setup();
    const request = deferred<{ message: string }>();
    mockUpdate.mockReturnValue(request.promise);

    const { result } = renderHook(() => useUpdateShoppingListItem(), {
      wrapper,
    });
    result.current.mutate({ id: "sli_1", quantity: 6 });

    await waitFor(() => expect(row(queryClient, "sli_1")?.quantity).toBe(6));
    expect(row(queryClient, "sli_1")?.obtained).toBe(false);
    expect(mockUpdate).toHaveBeenCalledWith("sli_1", { quantity: 6 });
    request.resolve({ message: "ok" });
  });

  it("rolls the optimistic change back when the request fails", async () => {
    const { queryClient, wrapper } = setup();
    const request = deferred<{ message: string }>();
    mockUpdate.mockReturnValue(request.promise);

    const { result } = renderHook(() => useUpdateShoppingListItem(), {
      wrapper,
    });
    result.current.mutate({ id: "sli_1", obtained: true });
    await waitFor(() => expect(row(queryClient, "sli_1")?.obtained).toBe(true));

    request.reject(new Error("network error"));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(row(queryClient, "sli_1")?.obtained).toBe(false);
  });

  it("refetches the list once the change has saved", async () => {
    const { queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    mockUpdate.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useUpdateShoppingListItem(), {
      wrapper,
    });
    result.current.mutate({ id: "sli_1", obtained: true });

    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: shoppingListKeys.list(),
      }),
    );
  });

  it("refetches the list after a failure, so other rows aren't rolled back", async () => {
    const { queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    mockUpdate.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useUpdateShoppingListItem(), {
      wrapper,
    });
    result.current.mutate({ id: "sli_1", obtained: true });

    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: shoppingListKeys.list(),
      }),
    );
  });

  it("holds the refetch until the last change in flight has saved", async () => {
    const { queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const first = deferred<{ message: string }>();
    const second = deferred<{ message: string }>();
    mockUpdate
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    const { result } = renderHook(() => useUpdateShoppingListItem(), {
      wrapper,
    });
    result.current.mutate({ id: "sli_1", obtained: true });
    result.current.mutate({ id: "sli_2", obtained: true });
    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(2));

    first.resolve({ message: "ok" });
    await waitFor(() => expect(row(queryClient, "sli_1")?.obtained).toBe(true));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(invalidate).not.toHaveBeenCalled();

    second.resolve({ message: "ok" });
    await waitFor(() => expect(invalidate).toHaveBeenCalledTimes(1));
  });

  // e.g. the session ended mid-request and endSession removed every cache.
  it("doesn't bring the list back if it was wiped while the request was in flight", async () => {
    const { queryClient, wrapper } = setup();
    mockUpdate.mockImplementation(() => {
      queryClient.removeQueries({ queryKey: shoppingListKeys.list() });
      return Promise.reject(new Error("session expired"));
    });

    const { result } = renderHook(() => useUpdateShoppingListItem(), {
      wrapper,
    });
    result.current.mutate({ id: "sli_1", obtained: true });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(shoppingListKeys.list())).toBeUndefined();
  });
});
