import type { Ref } from "react";
import { buildShoppingListItem } from "@/test/shoppingListFixtures";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ShoppingListItem } from "../data/types";
import { groupShoppingList } from "../utils/groupShoppingList";
import { ShoppingListCategory } from "./ShoppingListCategory";

vi.mock("./ShoppingListRow", () => ({
  ShoppingListRow: ({
    item,
    flashKey,
    ref,
  }: {
    item: ShoppingListItem;
    flashKey?: number;
    ref?: Ref<HTMLDivElement>;
  }) => (
    <div ref={ref} data-testid="row" data-flash={flashKey ?? ""}>
      {item.itemName}
    </div>
  ),
}));

function group(obtained: [boolean, boolean]) {
  return groupShoppingList([
    buildShoppingListItem({
      id: "a",
      itemId: "i_1",
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

const added = { itemId: "i_1", unitId: null, key: 7 };

afterEach(() => {
  vi.restoreAllMocks();
});

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

  it("opens and flashes the row that was just added", () => {
    const { rerender } = render(
      <ShoppingListCategory group={group([true, true])} />,
    );
    expect(header()).toHaveAttribute("aria-expanded", "false");

    rerender(
      <ShoppingListCategory
        group={group([true, true])}
        recentlyAdded={{ itemId: "i_1", unitId: null, key: 7 }}
      />,
    );

    expect(header()).toHaveAttribute("aria-expanded", "true");
    const rows = screen.getAllByTestId("row");
    expect(rows.map((row) => row.getAttribute("data-flash"))).toEqual([
      "7",
      "",
    ]);
  });

  it("ignores an addition that belongs to another category", () => {
    render(
      <ShoppingListCategory
        group={group([true, true])}
        recentlyAdded={{ itemId: "i_other", unitId: null, key: 7 }}
      />,
    );

    expect(header()).toHaveAttribute("aria-expanded", "false");
  });

  it("scrolls the added row into view once the category has finished opening", async () => {
    const scroll = vi.spyOn(Element.prototype, "scrollIntoView");
    const { rerender } = render(
      <ShoppingListCategory group={group([true, true])} />,
    );

    rerender(
      <ShoppingListCategory
        group={group([true, true])}
        recentlyAdded={added}
      />,
    );
    expect(scroll).not.toHaveBeenCalled();

    await waitFor(() => expect(scroll).toHaveBeenCalledTimes(1));
    expect(scroll).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "nearest",
    });
    expect(scroll.mock.contexts[0]).toBe(screen.getByText("Onions"));
  });

  it("scrolls the added row into view straight away when already open", () => {
    const scroll = vi.spyOn(Element.prototype, "scrollIntoView");
    const { rerender } = render(
      <ShoppingListCategory group={group([true, false])} />,
    );

    rerender(
      <ShoppingListCategory
        group={group([true, false])}
        recentlyAdded={added}
      />,
    );

    expect(scroll).toHaveBeenCalledTimes(1);
    expect(scroll.mock.contexts[0]).toBe(screen.getByText("Onions"));
  });

  it("doesn't scroll again when reopened by hand after an addition", async () => {
    const scroll = vi.spyOn(Element.prototype, "scrollIntoView");
    render(
      <ShoppingListCategory
        group={group([true, false])}
        recentlyAdded={added}
      />,
    );
    await waitFor(() => expect(scroll).toHaveBeenCalledTimes(1));

    await userEvent.click(header());
    await waitFor(() =>
      expect(screen.queryByText("Onions")).not.toBeInTheDocument(),
    );
    await userEvent.click(header());
    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(scroll).toHaveBeenCalledTimes(1);
  });

  it("doesn't replay the flash when the category is closed and reopened", async () => {
    render(
      <ShoppingListCategory
        group={group([true, false])}
        recentlyAdded={added}
      />,
    );
    expect(screen.getByText("Onions")).toHaveAttribute("data-flash", "7");

    await userEvent.click(header());
    await waitFor(() =>
      expect(screen.queryByText("Onions")).not.toBeInTheDocument(),
    );
    await userEvent.click(header());

    expect(screen.getByText("Onions")).toHaveAttribute("data-flash", "");
  });
});
