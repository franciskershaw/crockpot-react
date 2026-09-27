import { shoppingListKeys } from "@/features/shopping-list/data/queryKeys";
import { deferred, setupQueryClient } from "@/test/queryClientTestUtils";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { menuKeys } from "../data/queryKeys";
import type { Menu } from "../data/types";
import type { MenuTransform } from "../utils/menuTransforms";
import { useOptimisticMenuMutation } from "./useOptimisticMenuMutation";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

const MARKED: Menu = {
  entries: [{ recipeId: "r_marked", serves: 2, recipe: buildRecipeCard() }],
};

function transform() {
  return {
    capture: vi.fn(() => "before-token"),
    apply: vi.fn(() => MARKED),
    revert: vi.fn(() => ({ entries: [] })),
  } satisfies MenuTransform<string, string>;
}

function setup() {
  return setupQueryClient([
    [menuKeys.menu(), { entries: [] } satisfies Menu],
    [shoppingListKeys.list(), { items: [] }],
  ]);
}

function menu(queryClient: ReturnType<typeof setup>["queryClient"]) {
  return queryClient.getQueryData<Menu>(menuKeys.menu());
}

function refetchedMenu(invalidate: { mock: { calls: unknown[][] } }) {
  return invalidate.mock.calls.some(
    ([filters]) =>
      JSON.stringify(filters) === JSON.stringify({ queryKey: menuKeys.menu() }),
  );
}

describe("useOptimisticMenuMutation", () => {
  it("cancels in-flight menu fetches, then applies the change before the request resolves", async () => {
    const { queryClient, wrapper } = setup();
    const cancel = vi.spyOn(queryClient, "cancelQueries");
    const request = deferred<{ message: string }>();
    const t = transform();

    const { result } = renderHook(
      () =>
        useOptimisticMenuMutation({ mutationFn: () => request.promise, ...t }),
      { wrapper },
    );
    result.current.mutate("vars");

    await waitFor(() => expect(menu(queryClient)).toEqual(MARKED));
    expect(cancel).toHaveBeenCalledWith({ queryKey: menuKeys.menu() });
    expect(t.apply).toHaveBeenCalledWith({ entries: [] }, "vars");
    request.resolve({ message: "ok" });
  });

  it("reverts with its own captured state when the request fails", async () => {
    const { queryClient, wrapper } = setup();
    const t = transform();

    const { result } = renderHook(
      () =>
        useOptimisticMenuMutation({
          mutationFn: () => Promise.reject(new Error("boom")),
          ...t,
        }),
      { wrapper },
    );
    result.current.mutate("vars");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(t.revert).toHaveBeenCalledWith(MARKED, "vars", "before-token");
    expect(menu(queryClient)).toEqual({ entries: [] });
  });

  it("refetches the menu after a failure when nothing else is in flight", async () => {
    const { queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(
      () =>
        useOptimisticMenuMutation({
          mutationFn: () => Promise.reject(new Error("boom")),
          ...transform(),
        }),
      { wrapper },
    );
    result.current.mutate("vars");

    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() => expect(refetchedMenu(invalidate)).toBe(true));
  });

  it("defers the refetch after a failure until the last menu change settles", async () => {
    const { queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const slow = deferred<{ message: string }>();

    const pending = renderHook(
      () =>
        useOptimisticMenuMutation({
          mutationFn: () => slow.promise,
          ...transform(),
        }),
      { wrapper },
    );
    const failing = renderHook(
      () =>
        useOptimisticMenuMutation({
          mutationFn: () => Promise.reject(new Error("boom")),
          ...transform(),
        }),
      { wrapper },
    );

    pending.result.current.mutate("slow");
    await waitFor(() => expect(pending.result.current.isPending).toBe(true));
    failing.result.current.mutate("fails");
    await waitFor(() => expect(failing.result.current.isError).toBe(true));

    expect(refetchedMenu(invalidate)).toBe(false);

    slow.resolve({ message: "ok" });
    await waitFor(() => expect(pending.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(refetchedMenu(invalidate)).toBe(true));
  });

  it("never refetches the menu after a success, but marks the shopping list stale", async () => {
    const { queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(
      () =>
        useOptimisticMenuMutation({
          mutationFn: () => Promise.resolve({ message: "ok" }),
          ...transform(),
        }),
      { wrapper },
    );
    result.current.mutate("vars");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(refetchedMenu(invalidate)).toBe(false);
    expect(
      queryClient.getQueryState(shoppingListKeys.list())?.isInvalidated,
    ).toBe(true);
  });
});
