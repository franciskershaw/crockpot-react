import type { Item, Unit } from "@/features/catalog/data/types";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AddItemEditor } from "./AddItemEditor";

const item: Item = {
  id: "i_1",
  name: "Chicken thighs",
  categoryId: "c_1",
  allowedUnitIds: ["u_g", "u_kg"],
};
const allowedUnits: Unit[] = [
  { id: "u_g", name: "Gram", abbreviation: "g" },
  { id: "u_kg", name: "Kilogram", abbreviation: "kg" },
];

function setup({ isPending = false, isError = false } = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <AddItemEditor
      item={item}
      allowedUnits={allowedUnits}
      isPending={isPending}
      isError={isError}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  );
  return {
    onConfirm,
    onCancel,
    quantity: screen.getByLabelText("Quantity") as HTMLInputElement,
  };
}

describe("AddItemEditor", () => {
  it("opens with a quantity of 1, focused with the cursor at the end, and no unit", () => {
    const { quantity } = setup();

    expect(screen.getByText("Chicken thighs")).toBeInTheDocument();
    expect(quantity).toHaveValue("1");
    expect(quantity).toHaveFocus();
    expect(quantity.selectionStart).toBe(1);
    expect(quantity.selectionEnd).toBe(1);
    expect(screen.getByRole("combobox", { name: "Unit" })).toHaveTextContent(
      "No unit",
    );
  });

  it("adds with the typed quantity and no unit on Enter", async () => {
    const { onConfirm } = setup();

    await userEvent.keyboard("{Backspace}500{Enter}");

    expect(onConfirm).toHaveBeenCalledWith(500, null);
  });

  it("offers No unit then the item's allowed units, and adds with the chosen one", async () => {
    const { onConfirm } = setup();

    await userEvent.click(screen.getByRole("combobox", { name: "Unit" }));
    const options = screen.getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "No unit",
      "Gramg",
      "Kilogramkg",
    ]);
    await userEvent.click(options[1]);

    expect(screen.getByRole("combobox", { name: "Unit" })).toHaveTextContent(
      "g",
    );
    await userEvent.click(screen.getByRole("button", { name: "Add to list" }));

    expect(onConfirm).toHaveBeenCalledWith(1, "u_g");
  });

  it("won't add an empty or zero quantity", async () => {
    const { quantity, onConfirm } = setup();

    await userEvent.clear(quantity);
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Add to list" })).toBeDisabled();

    await userEvent.type(quantity, "0{Enter}");
    expect(screen.getByRole("button", { name: "Add to list" })).toBeDisabled();

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("limits the quantity to 6 digits and 2 decimal places", async () => {
    const { quantity } = setup();

    await userEvent.type(quantity, "234567");
    expect(quantity).toHaveValue("123456");

    await userEvent.clear(quantity);
    await userEvent.type(quantity, "1.255");
    expect(quantity).toHaveValue("1.25");
  });

  it("cancels on Escape and on the cancel button", async () => {
    const { onCancel } = setup();

    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it("shows progress instead of the add button while adding", async () => {
    const { onConfirm } = setup({ isPending: true });

    expect(
      screen.queryByRole("button", { name: "Add to list" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Adding" })).toBeInTheDocument();
    await userEvent.keyboard("{Enter}");

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("marks the editor as failed when the add errored", () => {
    setup({ isError: true });

    expect(screen.getByLabelText("Quantity")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});
