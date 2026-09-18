import { useMenuEntry } from "@/features/menu/hooks/useMenuEntry";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { HydratedIngredient } from "../types";
import { scaleIngredients, useIngredientServes } from "./useIngredientServes";

vi.mock("@/features/menu/hooks/useMenuEntry", () => ({
  useMenuEntry: vi.fn(),
}));

const mockUseMenuEntry = vi.mocked(useMenuEntry);

afterEach(() => {
  vi.clearAllMocks();
});

function ingredient(
  overrides: Partial<HydratedIngredient> = {},
): HydratedIngredient {
  return {
    itemId: "item_1",
    itemName: "Onion",
    itemCategoryId: "cat_1",
    itemCategoryName: "Veg",
    unitId: null,
    unitAbbreviation: null,
    quantity: 2,
    ...overrides,
  };
}

describe("scaleIngredients", () => {
  it("scales quantities up proportionally", () => {
    const scaled = scaleIngredients([ingredient({ quantity: 2 })], 4, 8);
    expect(scaled[0].quantity).toBe(4);
  });

  it("scales quantities down proportionally", () => {
    const scaled = scaleIngredients([ingredient({ quantity: 4 })], 4, 2);
    expect(scaled[0].quantity).toBe(2);
  });

  it("rounds to 2 decimal places", () => {
    const scaled = scaleIngredients([ingredient({ quantity: 1 })], 3, 1);
    expect(scaled[0].quantity).toBe(0.33);
  });

  it("returns ingredients unchanged when originalServes is zero", () => {
    const scaled = scaleIngredients([ingredient({ quantity: 5 })], 0, 8);
    expect(scaled[0].quantity).toBe(5);
  });

  it("returns ingredients unchanged when newServes is zero", () => {
    const scaled = scaleIngredients([ingredient({ quantity: 5 })], 4, 0);
    expect(scaled[0].quantity).toBe(5);
  });

  it("preserves every other field unchanged", () => {
    const original = ingredient({ itemName: "Carrot" });
    const [scaled] = scaleIngredients([original], 4, 8);
    expect(scaled).toMatchObject({
      itemId: original.itemId,
      itemName: "Carrot",
      itemCategoryId: original.itemCategoryId,
      itemCategoryName: original.itemCategoryName,
      unitId: original.unitId,
      unitAbbreviation: original.unitAbbreviation,
    });
  });
});

describe("useIngredientServes", () => {
  it("defaults effectiveServes to the recipe's own serves when not in the menu", () => {
    mockUseMenuEntry.mockReturnValue({
      isInMenu: false,
      serves: undefined,
      isPending: false,
    });
    const { result } = renderHook(() => useIngredientServes("r_1", 4));

    expect(result.current.effectiveServes).toBe(4);
  });

  it("defaults effectiveServes to the menu entry's serves when in the menu", () => {
    mockUseMenuEntry.mockReturnValue({
      isInMenu: true,
      serves: 8,
      isPending: false,
    });
    const { result } = renderHook(() => useIngredientServes("r_1", 4));

    expect(result.current.effectiveServes).toBe(8);
  });

  it("adjustServes moves the local value independently of the menu default", () => {
    mockUseMenuEntry.mockReturnValue({
      isInMenu: true,
      serves: 8,
      isPending: false,
    });
    const { result } = renderHook(() => useIngredientServes("r_1", 4));

    act(() => result.current.adjustServes(-2));

    expect(result.current.effectiveServes).toBe(6);
  });

  it("clamps at the minimum of 1", () => {
    mockUseMenuEntry.mockReturnValue({
      isInMenu: false,
      serves: undefined,
      isPending: false,
    });
    const { result } = renderHook(() => useIngredientServes("r_1", 1));

    expect(result.current.canDecrease).toBe(false);
    act(() => result.current.adjustServes(-1));
    expect(result.current.effectiveServes).toBe(1);
  });

  it("clamps at the maximum of 50", () => {
    mockUseMenuEntry.mockReturnValue({
      isInMenu: false,
      serves: undefined,
      isPending: false,
    });
    const { result } = renderHook(() => useIngredientServes("r_1", 49));

    act(() => result.current.adjustServes(1));
    expect(result.current.effectiveServes).toBe(50);
    expect(result.current.canIncrease).toBe(false);

    act(() => result.current.adjustServes(1));
    expect(result.current.effectiveServes).toBe(50);
  });

  it("resets a local override once the underlying default changes", () => {
    mockUseMenuEntry.mockReturnValue({
      isInMenu: false,
      serves: undefined,
      isPending: false,
    });
    const { result, rerender } = renderHook(
      ({ originalServes }) => useIngredientServes("r_1", originalServes),
      { initialProps: { originalServes: 4 } },
    );

    act(() => result.current.adjustServes(2));
    expect(result.current.effectiveServes).toBe(6);

    mockUseMenuEntry.mockReturnValue({
      isInMenu: true,
      serves: 10,
      isPending: false,
    });
    rerender({ originalServes: 4 });

    expect(result.current.effectiveServes).toBe(10);
  });
});
