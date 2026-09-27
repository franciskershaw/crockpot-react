import { buildShoppingListItem } from "@/test/shoppingListFixtures";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { ShoppingListItem } from "../data/types";
import { groupShoppingList } from "../utils/groupShoppingList";
import { ShoppingListCategory } from "./ShoppingListCategory";

vi.mock("./ShoppingListRow", () => ({
  ShoppingListRow: ({ item }: { item: ShoppingListItem }) => (
    <div data-testid="row">{item.itemName}</div>
  ),
}));

function group(obtained: [boolean, boolean]) {
  return groupShoppingList([
    buildShoppingListItem({
      id: "a",
      itemName: "Onions",
      obtained: obtained[0],
    }),
    buildShoppingListItem({
      id: "b",
      itemName: "Garlic",
      obtained: obtained[1],
    }),
  ]).groups[0];
}

function header() {
  return screen.getByRole("button", { name: /Fruit & veg/ });
}

describe("ShoppingListCategory", () => {
  it("starts collapsed when every item is already ticked", () => {
    render(<ShoppingListCategory group={group([true, true])} />);

    expect(header()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Onions")).not.toBeInTheDocument();
  });

  it("closes itself shortly after the last item is ticked", async () => {
    const { rerender } = render(
      <ShoppingListCategory group={group([true, false])} />,
    );
    expect(header()).toHaveAttribute("aria-expanded", "true");

    rerender(<ShoppingListCategory group={group([true, true])} />);

    expect(header()).toHaveAttribute("aria-expanded", "true");
    await waitFor(() =>
      expect(header()).toHaveAttribute("aria-expanded", "false"),
    );
  });

  it("stays open if the last item is unticked again before it closes", async () => {
    const { rerender } = render(
      <ShoppingListCategory group={group([true, false])} />,
    );

    rerender(<ShoppingListCategory group={group([true, true])} />);
    rerender(<ShoppingListCategory group={group([true, false])} />);

    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(header()).toHaveAttribute("aria-expanded", "true");
  });

  it("can be reopened by hand once complete", async () => {
    render(<ShoppingListCategory group={group([true, true])} />);

    await userEvent.click(header());

    expect(header()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Onions")).toBeInTheDocument();
  });
});
