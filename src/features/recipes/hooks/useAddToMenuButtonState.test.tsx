import { useAddToMenu } from "@/features/menu/hooks/useAddToMenu";
import { useMenuEntry } from "@/features/menu/hooks/useMenuEntry";
import { useRemoveFromMenu } from "@/features/menu/hooks/useRemoveFromMenu";
import { useUpdateMenuEntryServes } from "@/features/menu/hooks/useUpdateMenuEntryServes";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { RecipeCard as RecipeCardData } from "../types";
import { useAddToMenuButtonState } from "./useAddToMenuButtonState";

vi.mock("@/features/menu/hooks/useMenuEntry", () => ({
  useMenuEntry: vi.fn(),
}));
vi.mock("@/features/menu/hooks/useAddToMenu", () => ({
  useAddToMenu: vi.fn(),
}));
vi.mock("@/features/menu/hooks/useUpdateMenuEntryServes", () => ({
  useUpdateMenuEntryServes: vi.fn(),
}));
vi.mock("@/features/menu/hooks/useRemoveFromMenu", () => ({
  useRemoveFromMenu: vi.fn(),
}));

const mockUseMenuEntry = vi.mocked(useMenuEntry);
const mockUseAddToMenu = vi.mocked(useAddToMenu);
const mockUseUpdateMenuEntryServes = vi.mocked(useUpdateMenuEntryServes);
const mockUseRemoveFromMenu = vi.mocked(useRemoveFromMenu);

const stubEvent = {
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
} as unknown as React.MouseEvent;

afterEach(() => {
  vi.clearAllMocks();
});

function recipe(overrides: Partial<RecipeCardData> = {}): RecipeCardData {
  return {
    id: "r_1",
    name: "BBQ Pulled Pork",
    imageUrl: null,
    imageFilename: null,
    timeInMinutes: 30,
    serves: 4,
    approved: true,
    categories: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    isFavourite: false,
    matchedIngredientCount: 0,
    totalIngredientCount: 0,
    matchedCategoryCount: 0,
    score: 0,
    tier: null,
    ...overrides,
  };
}

function setup({
  isInMenu = false,
  serves,
  isPending = false,
}: {
  isInMenu?: boolean;
  serves?: number;
  isPending?: boolean;
} = {}) {
  mockUseMenuEntry.mockReturnValue({ isInMenu, serves, isPending });
  const addToMenu = { mutate: vi.fn(), isPending: false };
  const updateServes = { mutate: vi.fn(), isPending: false };
  const removeFromMenu = { mutate: vi.fn(), isPending: false };
  mockUseAddToMenu.mockReturnValue(
    addToMenu as unknown as ReturnType<typeof useAddToMenu>,
  );
  mockUseUpdateMenuEntryServes.mockReturnValue(
    updateServes as unknown as ReturnType<typeof useUpdateMenuEntryServes>,
  );
  mockUseRemoveFromMenu.mockReturnValue(
    removeFromMenu as unknown as ReturnType<typeof useRemoveFromMenu>,
  );
  return { addToMenu, updateServes, removeFromMenu };
}

describe("useAddToMenuButtonState", () => {
  it("defaults servingAmount to the recipe's own serves when not in the menu", () => {
    setup({ isInMenu: false });
    const { result } = renderHook(() => useAddToMenuButtonState(recipe()));

    expect(result.current.servingAmount).toBe(4);
    expect(result.current.isEditing).toBe(false);
  });

  it("clicking the cart opens the editor", () => {
    setup({ isInMenu: false });
    const { result } = renderHook(() => useAddToMenuButtonState(recipe()));

    act(() => result.current.handleCartClick(stubEvent));

    expect(result.current.isEditing).toBe(true);
  });

  it("adjustAmount clamps between 1 and 50", () => {
    setup({ isInMenu: false });
    const { result } = renderHook(() =>
      useAddToMenuButtonState(recipe({ serves: 1 })),
    );

    expect(result.current.canDecrease).toBe(false);

    act(() => result.current.adjustAmount(stubEvent, -1));
    expect(result.current.servingAmount).toBe(1);

    act(() => {
      for (let i = 0; i < 49; i++) result.current.adjustAmount(stubEvent, 1);
    });
    expect(result.current.servingAmount).toBe(50);
    expect(result.current.canIncrease).toBe(false);
  });

  it("cancel closes the editor and resets servingAmount to the default", () => {
    setup({ isInMenu: false });
    const { result } = renderHook(() =>
      useAddToMenuButtonState(recipe({ serves: 4 })),
    );

    act(() => result.current.handleCartClick(stubEvent));
    act(() => result.current.adjustAmount(stubEvent, 1));
    expect(result.current.servingAmount).toBe(5);

    act(() => result.current.handleCancel(stubEvent));

    expect(result.current.isEditing).toBe(false);
    expect(result.current.servingAmount).toBe(4);
  });

  it("confirm calls addToMenu when not already in the menu", () => {
    const { addToMenu, updateServes } = setup({ isInMenu: false });
    const { result } = renderHook(() =>
      useAddToMenuButtonState(recipe({ serves: 4 })),
    );

    act(() => result.current.handleConfirm(stubEvent));

    expect(addToMenu.mutate).toHaveBeenCalledWith(
      { recipe: recipe({ serves: 4 }), serves: 4 },
      expect.anything(),
    );
    expect(updateServes.mutate).not.toHaveBeenCalled();
  });

  it("confirm calls updateMenuEntryServes when already in the menu", () => {
    const { addToMenu, updateServes } = setup({ isInMenu: true, serves: 6 });
    const { result } = renderHook(() => useAddToMenuButtonState(recipe()));

    act(() => result.current.handleConfirm(stubEvent));

    expect(updateServes.mutate).toHaveBeenCalledWith(
      { recipeId: "r_1", serves: 6 },
      expect.anything(),
    );
    expect(addToMenu.mutate).not.toHaveBeenCalled();
  });

  it("remove calls removeFromMenu", () => {
    const { removeFromMenu } = setup({ isInMenu: true, serves: 6 });
    const { result } = renderHook(() => useAddToMenuButtonState(recipe()));

    act(() => result.current.handleRemove(stubEvent));

    expect(removeFromMenu.mutate).toHaveBeenCalledWith(
      { recipeId: "r_1" },
      expect.anything(),
    );
  });
});
