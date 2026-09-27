import { useMenu } from "@/features/menu/hooks/useMenu";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { buildShoppingListItem } from "@/test/shoppingListFixtures";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ShoppingListItem } from "../data/types";
import { useClearShoppingList } from "../hooks/useClearShoppingList";
import { useRegenerateShoppingList } from "../hooks/useRegenerateShoppingList";
import { useShoppingList } from "../hooks/useShoppingList";
import { ShoppingListPanel } from "./ShoppingListPanel";

vi.mock("@/features/menu/hooks/useMenu", () => ({ useMenu: vi.fn() }));
vi.mock("../hooks/useShoppingList", () => ({ useShoppingList: vi.fn() }));
vi.mock("../hooks/useRegenerateShoppingList", () => ({
  useRegenerateShoppingList: vi.fn(),
}));
vi.mock("../hooks/useClearShoppingList", () => ({
  useClearShoppingList: vi.fn(),
}));
vi.mock("./AddExtraItem", () => ({
  AddExtraItem: ({
    onAdded,
  }: {
    onAdded: (added: {
      itemId: string;
      unitId: string | null;
      key: number;
    }) => void;
  }) => (
    <button
      type="button"
      onClick={() => onAdded({ itemId: "i_milk", unitId: null, key: 1 })}
    >
      add milk
    </button>
  ),
}));
vi.mock("./ShoppingListRow", () => ({
  ShoppingListRow: ({ item }: { item: ShoppingListItem }) => (
    <div data-testid="row">{item.itemName}</div>
  ),
}));

const regenerate = vi.fn();
const clear = vi.fn();

function setup({
  items = [] as ShoppingListItem[],
  recipeCount = 2,
  onClose,
}: {
  items?: ShoppingListItem[];
  recipeCount?: number;
  onClose?: () => void;
} = {}) {
  vi.mocked(useShoppingList).mockReturnValue({
    data: { items },
  } as unknown as ReturnType<typeof useShoppingList>);
  vi.mocked(useMenu).mockReturnValue({
    data: {
      entries: Array.from({ length: recipeCount }, (_, i) => ({
        recipeId: `r_${i}`,
        serves: 4,
        recipe: buildRecipeCard({ id: `r_${i}` }),
      })),
    },
  } as unknown as ReturnType<typeof useMenu>);
  render(<ShoppingListPanel onClose={onClose} />);
}

beforeEach(() => {
  vi.mocked(useRegenerateShoppingList).mockReturnValue({
    mutate: regenerate,
    isPending: false,
  } as unknown as ReturnType<typeof useRegenerateShoppingList>);
  vi.mocked(useClearShoppingList).mockReturnValue({
    mutate: clear,
  } as unknown as ReturnType<typeof useClearShoppingList>);
});

afterEach(() => {
  vi.clearAllMocks();
});

const veg = { itemCategoryId: "ic_veg", itemCategoryName: "Veg" };
const dairy = { itemCategoryId: "ic_dairy", itemCategoryName: "Dairy" };

const items = [
  buildShoppingListItem({
    id: "a",
    itemName: "Milk",
    ...dairy,
    obtained: true,
  }),
  buildShoppingListItem({ id: "d", itemName: "Butter", ...dairy }),
  buildShoppingListItem({
    id: "b",
    itemName: "Onions",
    ...veg,
    obtained: true,
  }),
  buildShoppingListItem({ id: "c", itemName: "Garlic", ...veg }),
];

describe("ShoppingListPanel", () => {
  it("shows the overall obtained / total count in the header", () => {
    setup({ items });

    expect(screen.getByText("2 / 4")).toBeInTheDocument();
  });

  it("groups rows under category headers with their own counts", () => {
    setup({ items });

    const dairyHeader = screen.getByRole("button", { name: /Dairy/ });
    const vegHeader = screen.getByRole("button", { name: /Veg/ });
    expect(dairyHeader).toHaveTextContent("1 / 2");
    expect(vegHeader).toHaveTextContent("1 / 2");
    expect(screen.getAllByTestId("row").map((r) => r.textContent)).toEqual([
      "Milk",
      "Butter",
      "Onions",
      "Garlic",
    ]);
  });

  it("starts categories expanded and collapses one when its header is clicked", async () => {
    setup({ items });

    const vegHeader = screen.getByRole("button", { name: /Veg/ });
    expect(vegHeader).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(vegHeader);

    expect(vegHeader).toHaveAttribute("aria-expanded", "false");
    await waitFor(() =>
      expect(screen.queryByText("Onions")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Milk")).toBeInTheDocument();
  });

  it("asks for confirmation before regenerating, naming what will be lost", async () => {
    setup({ items });

    await userEvent.click(screen.getByRole("button", { name: /Regenerate/ }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent(/added yourself/i);
    expect(dialog).toHaveTextContent(/ticked/i);
    expect(regenerate).not.toHaveBeenCalled();

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Regenerate list" }),
    );

    expect(regenerate).toHaveBeenCalled();
  });

  it("doesn't regenerate when the confirmation is cancelled", async () => {
    setup({ items });

    await userEvent.click(screen.getByRole("button", { name: /Regenerate/ }));
    await userEvent.click(
      within(await screen.findByRole("dialog")).getByRole("button", {
        name: "Cancel",
      }),
    );

    expect(regenerate).not.toHaveBeenCalled();
  });

  it("keeps Regenerate enabled for an empty list while the menu has recipes", () => {
    setup({ items: [], recipeCount: 1 });
    expect(screen.getByRole("button", { name: /Regenerate/ })).toBeEnabled();
  });

  it("disables Regenerate when the menu is empty", () => {
    setup({ items: [], recipeCount: 0 });
    expect(screen.getByRole("button", { name: /Regenerate/ })).toBeDisabled();
  });

  it("asks for confirmation before clearing the list", async () => {
    setup({ items });

    await userEvent.click(screen.getByRole("button", { name: "Clear list" }));
    const dialog = await screen.findByRole("dialog");
    expect(clear).not.toHaveBeenCalled();

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Clear list" }),
    );

    expect(clear).toHaveBeenCalled();
  });

  it("doesn't clear when the confirmation is cancelled", async () => {
    setup({ items });

    await userEvent.click(screen.getByRole("button", { name: "Clear list" }));
    await userEvent.click(
      within(await screen.findByRole("dialog")).getByRole("button", {
        name: "Cancel",
      }),
    );

    expect(clear).not.toHaveBeenCalled();
  });

  it("says how many recipes the list is built from", () => {
    setup({ items, recipeCount: 1 });
    expect(
      screen.getByText("Built from 1 recipe on your menu"),
    ).toBeInTheDocument();
  });

  it("explains how to rebuild an empty list", () => {
    setup({ items: [], recipeCount: 2 });
    expect(screen.getByText(/Your list is empty/)).toBeInTheDocument();
  });

  it("opens the category of an item that was just added", async () => {
    setup({
      items: [
        buildShoppingListItem({
          id: "a",
          itemId: "i_milk",
          itemName: "Milk",
          ...dairy,
          obtained: true,
        }),
      ],
    });
    const dairyHeader = screen.getByRole("button", { name: /Dairy/ });
    expect(dairyHeader).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(screen.getByRole("button", { name: "add milk" }));

    expect(dairyHeader).toHaveAttribute("aria-expanded", "true");
  });

  it("suggests adding a recipe or an item when the menu is empty too", () => {
    setup({ items: [], recipeCount: 0 });
    expect(screen.getByText(/Your list is empty\./)).toHaveTextContent(
      "Your list is empty. Add a recipe, or add an item by hand above.",
    );
  });

  it("only offers Clear list when there's something to clear", () => {
    setup({ items: [], recipeCount: 2 });
    expect(
      screen.queryByRole("button", { name: "Clear list" }),
    ).not.toBeInTheDocument();
  });

  it("offers a close button when it can be closed", async () => {
    const onClose = vi.fn();
    setup({ items, onClose });

    await userEvent.click(
      screen.getByRole("button", { name: "Close shopping list" }),
    );

    expect(onClose).toHaveBeenCalled();
  });

  it("has no close button when it can't be closed", () => {
    setup({ items });
    expect(
      screen.queryByRole("button", { name: "Close shopping list" }),
    ).not.toBeInTheDocument();
  });

  describe("while loading and on failure", () => {
    function setupState(state: {
      data?: { items: ShoppingListItem[] };
      isError?: boolean;
    }) {
      const refetch = vi.fn();
      vi.mocked(useMenu).mockReturnValue({
        data: { entries: [] },
      } as unknown as ReturnType<typeof useMenu>);
      vi.mocked(useShoppingList).mockReturnValue({
        data: undefined,
        isError: false,
        refetch,
        ...state,
      } as unknown as ReturnType<typeof useShoppingList>);
      render(<ShoppingListPanel />);
      return { refetch };
    }

    it("keeps the header and add row, with a loading placeholder in the body", () => {
      setupState({});

      expect(
        screen.getByText("Loading your shopping list…"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Shopping list" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "add milk" }),
      ).toBeInTheDocument();
    });

    it("offers a retry when the list fails to load", async () => {
      const { refetch } = setupState({ isError: true });

      expect(
        screen.getByText("Couldn't load your shopping list."),
      ).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Retry" }));
      expect(refetch).toHaveBeenCalled();
    });

    it("keeps the list on screen when a later refresh fails", () => {
      setupState({
        isError: true,
        data: { items: [buildShoppingListItem({ itemName: "Onions" })] },
      });

      expect(
        screen.queryByText("Couldn't load your shopping list."),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Fruit & veg")).toBeInTheDocument();
    });
  });
});
