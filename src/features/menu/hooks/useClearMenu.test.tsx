import { shoppingListKeys } from "@/features/shopping-list/data/queryKeys";
import { deferred, setupQueryClient } from "@/test/queryClientTestUtils";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { clearMenu } from "../data/api";
import { menuKeys } from "../data/queryKeys";
import type { Menu } from "../data/types";
import { useClearMenu } from "./useClearMenu";

vi.mock("../data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/api")>()),
  clearMenu: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockClearMenu = vi.mocked(clearMenu);

afterEach(() => {
  vi.clearAllMocks();
});

function setup() {
  return setupQueryClient([
    [
      menuKeys.menu(),
      {
        entries: [{ recipeId: "r_1", serves: 4, recipe: buildRecipeCard() }],
      } satisfies Menu,
    ],
    [shoppingListKeys.list(), { items: [] }],
  ]);
}

function entries(queryClient: ReturnType<typeof setup>["queryClient"]) {
  return queryClient.getQueryData<Menu>(menuKeys.menu())?.entries;
}

describe("useClearMenu", () => {
  it("empties the menu before the request resolves", async () => {
    const { queryClient, wrapper } = setup();
    const request = deferred<{ message: string }>();
    mockClearMenu.mockReturnValue(request.promise);

    const { result } = renderHook(() => useClearMenu(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(entries(queryClient)).toEqual([]));
    expect(mockClearMenu).toHaveBeenCalled();
    request.resolve({ message: "ok" });
  });

  it("restores the menu when the request fails", async () => {
    const { queryClient, wrapper } = setup();
    const request = deferred<{ message: string }>();
    mockClearMenu.mockReturnValue(request.promise);

    const { result } = renderHook(() => useClearMenu(), { wrapper });
    result.current.mutate();
    await waitFor(() => expect(entries(queryClient)).toEqual([]));

    request.reject(new Error("network error"));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(entries(queryClient)).toHaveLength(1);
  });

  it("marks the shopping list stale once the menu is cleared", async () => {
    const { queryClient, wrapper } = setup();
    mockClearMenu.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useClearMenu(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      queryClient.getQueryState(shoppingListKeys.list())?.isInvalidated,
    ).toBe(true);
  });

  it("refetches the menu after a failure, so other changes aren't rolled back", async () => {
    const { queryClient, wrapper } = setup();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    mockClearMenu.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useClearMenu(), { wrapper });
    result.current.mutate();

    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: menuKeys.menu() }),
    );
  });
});
