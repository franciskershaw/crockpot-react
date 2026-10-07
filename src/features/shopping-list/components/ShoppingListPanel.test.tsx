import { useMenu } from "@/features/menu/hooks/useMenu";
import { buildRecipeCard } from "@/test/recipeFixtures";
import {
  buildRegular,
  buildShoppingListItem,
} from "@/test/shoppingListFixtures";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Regular, ShoppingListItem } from "../data/types";
import { useClearShoppingList } from "../hooks/useClearShoppingList";
import { useRegenerateShoppingList } from "../hooks/useRegenerateShoppingList";
import { useRegulars } from "../hooks/useRegulars";
import { useRestockRegulars } from "../hooks/useRestockRegulars";
import { useShoppingList } from "../hooks/useShoppingList";
import { ShoppingListPanel } from "./ShoppingListPanel";

vi.mock("@/features/menu/hooks/useMenu", () => ({ useMenu: vi.fn() }));
vi.mock("../hooks/useShoppingList", () => ({ useShoppingList: vi.fn() }));
vi.mock("../hooks/useRegulars", () => ({ useRegulars: vi.fn() }));
vi.mock("../hooks/useRestockRegulars", () => ({
  useRestockRegulars: vi.fn(),
}));
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
const restock = vi.fn();

function setup({
  items = [] as ShoppingListItem[],
  recipeCount = 2,
  regulars = [] as Regular[],
  restockFailed = false,
  onClose,
}: {
  items?: ShoppingListItem[];
  recipeCount?: number;
  regulars?: Regular[];
  restockFailed?: boolean;
  onClose?: () => void;
} = {}) {
  vi.mocked(useRestockRegulars).mockReturnValue({
    mutate: restock,
    isPending: false,
    isError: restockFailed,
  } as unknown as ReturnType<typeof useRestockRegulars>);
  vi.mocked(useShoppingList).mockReturnValue({
    data: { items },
  } as unknown as ReturnType<typeof useShoppingList>);
  vi.mocked(useRegulars).mockReturnValue({
    data: regulars,
  } as unknown as ReturnType<typeof useRegulars>);
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

describe("ShoppingListPanel regulars", () => {
  const regulars = [
    buildRegular({ id: "reg_milk", itemName: "Milk" }),
    buildRegular({
      id: "reg_butter",
      itemId: "i_butter",
      itemName: "Butter",
      unitId: "u_g",
      unitAbbreviation: "g",
      quantity: 250,
    }),
    buildRegular({
      id: "reg_tp",
      itemId: "i_tp",
      itemName: "Toilet paper",
      categoryId: "ic_house",
      categoryName: "House",
      unitId: "u_rolls",
      unitAbbreviation: "rolls",
      quantity: 9,
    }),
  ];

  it("shows a Regulars row with how many are saved", () => {
    setup({ regulars });
    expect(
      screen.getByRole("button", { name: /Regulars.*3 saved/ }),
    ).toBeInTheDocument();
  });

  it("says None yet when there are no regulars", () => {
    setup({ regulars: [] });
    expect(
      screen.getByRole("button", { name: /Regulars.*None yet/ }),
    ).toBeInTheDocument();
  });

  it("keeps the Regulars row on an empty list and points the empty copy at it", () => {
    setup({ items: [], recipeCount: 0, regulars });
    expect(
      screen.getByRole("button", { name: /Regulars/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Your list is empty\./)).toHaveTextContent(
      "Your list is empty. Add a recipe, or restock your regulars above.",
    );
  });

  it("keeps the hand-add empty copy when there are no regulars", () => {
    setup({ items: [], recipeCount: 0, regulars: [] });
    expect(screen.getByText(/Your list is empty\./)).toHaveTextContent(
      "Your list is empty. Add a recipe, or add an item by hand above.",
    );
  });

  it("swaps the list for the regulars, grouped by category, when the row is opened", async () => {
    setup({
      items: [buildShoppingListItem({ itemName: "Onions" })],
      regulars,
    });

    await userEvent.click(screen.getByRole("button", { name: /Regulars/ }));

    expect(
      screen.getByRole("heading", { name: "Regulars" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Onions")).not.toBeInTheDocument();
    expect(screen.queryByText(/Built from/)).not.toBeInTheDocument();
    const dairy = screen.getByRole("group", { name: "Dairy" });
    expect(within(dairy).getByText("Milk")).toBeInTheDocument();
    expect(within(dairy).getByText("Butter")).toBeInTheDocument();
    expect(within(dairy).getByText("250 g")).toBeInTheDocument();
    const house = screen.getByRole("group", { name: "House" });
    expect(within(house).getByText("Toilet paper")).toBeInTheDocument();
    expect(within(house).getByText("9 rolls")).toBeInTheDocument();
  });

  it("goes back to the list from the regulars", async () => {
    setup({
      items: [buildShoppingListItem({ itemName: "Onions" })],
      regulars,
    });
    await userEvent.click(screen.getByRole("button", { name: /Regulars/ }));

    await userEvent.click(
      screen.getByRole("button", { name: "Back to shopping list" }),
    );

    expect(
      screen.getByRole("heading", { name: "Shopping list" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Onions")).toBeInTheDocument();
  });

  it("invites adding regulars when there are none", async () => {
    setup({ regulars: [] });

    await userEvent.click(screen.getByRole("button", { name: /Regulars/ }));

    expect(
      screen.getByRole("heading", { name: "No regulars yet" }),
    ).toBeInTheDocument();
  });
  it("disables a regular that's already on the list unbought, unticked and tagged", async () => {
    setup({
      items: [buildShoppingListItem({ itemId: "i_1", unitId: "u_pt" })],
      regulars,
    });

    await userEvent.click(screen.getByRole("button", { name: /Regulars/ }));

    const milk = screen.getByRole("checkbox", { name: "Add Milk" });
    expect(milk).toBeDisabled();
    expect(milk).not.toBeChecked();
    expect(screen.getAllByText("On your list")).toHaveLength(1);
    const butter = screen.getByRole("checkbox", { name: "Add Butter" });
    expect(butter).toBeEnabled();
    expect(butter).toBeChecked();
  });

  it("offers a regular whose list row is bought, ticked and untagged", async () => {
    setup({
      items: [
        buildShoppingListItem({
          itemId: "i_1",
          unitId: "u_pt",
          obtained: true,
        }),
      ],
      regulars,
    });

    await userEvent.click(screen.getByRole("button", { name: /Regulars/ }));

    const milk = screen.getByRole("checkbox", { name: "Add Milk" });
    expect(milk).toBeEnabled();
    expect(milk).toBeChecked();
    expect(screen.queryByText("On your list")).not.toBeInTheDocument();
  });
  describe("restock", () => {
    const milkOnList = buildShoppingListItem({ itemId: "i_1", unitId: "u_pt" });
    const confirmButton = () =>
      screen.getByRole("button", { name: /^Add \d+ to list$/ });

    async function openRegulars(options: Parameters<typeof setup>[0] = {}) {
      setup({ regulars, ...options });
      await userEvent.click(screen.getByRole("button", { name: /Regulars/ }));
    }

    it("adds every regular with Add all, ones already on the list included", async () => {
      await openRegulars({ items: [milkOnList] });

      await userEvent.click(
        screen.getByRole("button", { name: "Add all to list" }),
      );

      expect(restock).toHaveBeenCalledWith(
        ["reg_milk", "reg_butter", "reg_tp"],
        expect.anything(),
      );
    });

    it("counts the ticked regulars live and adds only those", async () => {
      await openRegulars({ items: [milkOnList] });
      expect(confirmButton()).toHaveTextContent("Add 2 to list");

      await userEvent.click(
        screen.getByRole("checkbox", { name: "Add Butter" }),
      );
      expect(confirmButton()).toHaveTextContent("Add 1 to list");
      await userEvent.click(confirmButton());

      expect(restock).toHaveBeenCalledWith(["reg_tp"], expect.anything());
    });

    it("can't confirm with nothing ticked", async () => {
      await openRegulars();
      for (const name of ["Add Milk", "Add Butter", "Add Toilet paper"]) {
        await userEvent.click(screen.getByRole("checkbox", { name }));
      }

      expect(confirmButton()).toHaveTextContent("Add 0 to list");
      expect(confirmButton()).toBeDisabled();
    });

    it("goes back to the list once the restock succeeds", async () => {
      restock.mockImplementation(
        (_ids: string[], options?: { onSuccess?: () => void }) =>
          options?.onSuccess?.(),
      );
      await openRegulars();

      await userEvent.click(
        screen.getByRole("button", { name: "Add all to list" }),
      );

      expect(
        screen.getByRole("heading", { name: "Shopping list" }),
      ).toBeInTheDocument();
    });

    it("stays on the regulars and says so when the restock fails", async () => {
      await openRegulars({ restockFailed: true });

      expect(
        screen.queryByText(/Couldn't add your regulars/),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Regulars" }),
      ).toBeInTheDocument();
    });
  });
});
