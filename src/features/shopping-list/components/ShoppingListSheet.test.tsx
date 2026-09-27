import { buildShoppingListItem } from "@/test/shoppingListFixtures";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useShoppingList } from "../hooks/useShoppingList";
import { ShoppingListSheet } from "./ShoppingListSheet";

vi.mock("../hooks/useShoppingList", () => ({ useShoppingList: vi.fn() }));
vi.mock("./ShoppingListPanel", () => ({
  ShoppingListPanel: ({ onClose }: { onClose?: () => void }) => (
    <aside data-testid="shopping-list">
      {onClose && (
        <button type="button" onClick={onClose}>
          Close shopping list
        </button>
      )}
    </aside>
  ),
}));

afterEach(() => {
  vi.clearAllMocks();
});

function setup(obtained: boolean[]) {
  vi.mocked(useShoppingList).mockReturnValue({
    data: {
      items: obtained.map((isObtained, i) =>
        buildShoppingListItem({ id: `i_${i}`, obtained: isObtained }),
      ),
    },
  } as unknown as ReturnType<typeof useShoppingList>);
  render(<ShoppingListSheet />);
}

function openButton() {
  return screen.getByRole("button", { name: /Open shopping list/ });
}

describe("ShoppingListSheet", () => {
  it("shows how many things are left to buy on the button", () => {
    setup([true, false, false]);
    expect(openButton()).toHaveAccessibleName(
      "Open shopping list, 2 left to buy",
    );
    expect(openButton()).toHaveTextContent("2");
  });

  it("drops the count once everything is ticked", () => {
    setup([true, true]);
    expect(openButton()).toHaveAccessibleName("Open shopping list");
    expect(openButton()).not.toHaveTextContent("0");
  });

  it("opens the shopping list in a sheet", async () => {
    setup([false]);
    expect(screen.queryByTestId("shopping-list")).not.toBeInTheDocument();

    await userEvent.click(openButton());

    expect(
      await screen.findByRole("dialog", { name: "Shopping list" }),
    ).toContainElement(screen.getByTestId("shopping-list"));
  });

  it("closes from the shopping list's own close button", async () => {
    setup([false]);
    await userEvent.click(openButton());

    await userEvent.click(
      await screen.findByRole("button", { name: "Close shopping list" }),
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});
