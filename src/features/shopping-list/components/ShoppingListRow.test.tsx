import { buildShoppingListItem } from "@/test/shoppingListFixtures";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useDeleteShoppingListItem } from "../hooks/useDeleteShoppingListItem";
import { useUpdateShoppingListItem } from "../hooks/useUpdateShoppingListItem";
import { ShoppingListRow } from "./ShoppingListRow";

vi.mock("../hooks/useUpdateShoppingListItem", () => ({
  useUpdateShoppingListItem: vi.fn(),
}));
vi.mock("../hooks/useDeleteShoppingListItem", () => ({
  useDeleteShoppingListItem: vi.fn(),
}));

const update = vi.fn();
const remove = vi.fn();
vi.mocked(useUpdateShoppingListItem).mockReturnValue({
  mutate: update,
} as unknown as ReturnType<typeof useUpdateShoppingListItem>);
vi.mocked(useDeleteShoppingListItem).mockReturnValue({
  mutate: remove,
} as unknown as ReturnType<typeof useDeleteShoppingListItem>);

afterEach(() => {
  update.mockClear();
  remove.mockClear();
});

function renderRow(overrides = {}) {
  render(
    <ShoppingListRow
      item={buildShoppingListItem({
        id: "sli_1",
        itemName: "Onions",
        quantity: 2,
        ...overrides,
      })}
    />,
  );
}

describe("ShoppingListRow", () => {
  it("ticks an unticked row", async () => {
    renderRow({ obtained: false });

    const checkbox = screen.getByRole("checkbox", {
      name: "Mark Onions as bought",
    });
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);

    expect(update).toHaveBeenCalledWith({ id: "sli_1", obtained: true });
  });

  it("unticks a ticked row", async () => {
    renderRow({ obtained: true });

    const checkbox = screen.getByRole("checkbox", {
      name: "Mark Onions as bought",
    });
    expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);

    expect(update).toHaveBeenCalledWith({ id: "sli_1", obtained: false });
  });

  it("removes the row", async () => {
    renderRow();

    await userEvent.click(
      screen.getByRole("button", { name: "Remove Onions" }),
    );

    expect(remove).toHaveBeenCalledWith({ id: "sli_1" });
  });

  it("shows the quantity and unit", () => {
    renderRow({ quantity: 250, unitAbbreviation: "g" });

    expect(
      screen.getByRole("button", { name: "Edit quantity of Onions" }),
    ).toHaveTextContent("250");
    expect(screen.getByText("g")).toBeInTheDocument();
  });

  it("edits the quantity inline and saves it", async () => {
    renderRow({ quantity: 2 });

    await userEvent.click(
      screen.getByRole("button", { name: "Edit quantity of Onions" }),
    );
    await userEvent.keyboard("{Backspace}6{Enter}");

    expect(update).toHaveBeenCalledWith({ id: "sli_1", quantity: 6 });
    await waitFor(() =>
      expect(screen.queryByLabelText("Quantity")).not.toBeInTheDocument(),
    );
  });

  it("closes the editor without saving when cancelled or unchanged", async () => {
    renderRow({ quantity: 2 });
    const pill = () =>
      screen.findByRole("button", { name: "Edit quantity of Onions" });

    await userEvent.click(await pill());
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByLabelText("Quantity")).not.toBeInTheDocument(),
    );

    await userEvent.click(await pill());
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
    await userEvent.keyboard("{Backspace}2{Enter}");
    await waitFor(() =>
      expect(screen.queryByLabelText("Quantity")).not.toBeInTheDocument(),
    );

    expect(update).not.toHaveBeenCalled();
  });

  it("flashes when given a flash key", () => {
    const { container, rerender } = render(
      <ShoppingListRow item={buildShoppingListItem()} />,
    );
    expect(container.querySelector("[data-row-flash]")).toBeNull();

    rerender(<ShoppingListRow item={buildShoppingListItem()} flashKey={3} />);

    expect(container.querySelector("[data-row-flash]")).not.toBeNull();
  });
});
