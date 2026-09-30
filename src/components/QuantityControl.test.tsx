import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { QuantityControl } from "./QuantityControl";

async function openEditor(quantity = 2) {
  const onCommit = vi.fn();
  render(
    <QuantityControl
      itemName="Onions"
      quantity={quantity}
      unitAbbreviation={null}
      obtained={false}
      onCommit={onCommit}
    />,
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Edit quantity of Onions" }),
  );
  return { onCommit, input: await screen.findByLabelText("Quantity") };
}

describe("QuantityControl", () => {
  it("opens focused with the cursor after the current quantity", async () => {
    const { input, onCommit } = await openEditor(2);

    expect(input).toHaveFocus();
    expect(input).toHaveValue("2");
    expect((input as HTMLInputElement).selectionStart).toBe(1);
    expect((input as HTMLInputElement).selectionEnd).toBe(1);
    await userEvent.keyboard("{Backspace}6");
    await userEvent.click(
      screen.getByRole("button", { name: "Confirm quantity" }),
    );

    expect(onCommit).toHaveBeenCalledWith(6);
  });

  it("confirms on Enter with a decimal quantity", async () => {
    const { input, onCommit } = await openEditor(2);

    await userEvent.clear(input);
    await userEvent.type(input, "1.5{Enter}");

    expect(onCommit).toHaveBeenCalledWith(1.5);
  });

  it("closes without committing when cancelled", async () => {
    const { onCommit } = await openEditor();

    await userEvent.click(
      await screen.findByRole("button", { name: "Cancel" }),
    );

    await waitFor(() =>
      expect(screen.queryByLabelText("Quantity")).not.toBeInTheDocument(),
    );
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("limits typing to 6 digits and 2 decimal places", async () => {
    const { input } = await openEditor();

    await userEvent.clear(input);
    await userEvent.type(input, "1e5");
    expect(input).toHaveValue("15");

    await userEvent.clear(input);
    await userEvent.type(input, "-1");
    expect(input).toHaveValue("1");

    await userEvent.clear(input);
    await userEvent.type(input, "12345678.999");
    expect(input).toHaveValue("123456.99");
  });

  it.each(["", "0", "abc"])(
    "won't confirm an invalid quantity (%j)",
    async (value) => {
      const { input, onCommit } = await openEditor();

      await userEvent.clear(input);
      if (value) await userEvent.type(input, value);
      await userEvent.keyboard("{Enter}");

      expect(
        screen.getByRole("button", { name: "Confirm quantity" }),
      ).toBeDisabled();
      expect(onCommit).not.toHaveBeenCalled();
    },
  );

  describe("with units", () => {
    const units = [
      { id: "u_g", name: "Gram", abbreviation: "g" },
      { id: "u_kg", name: "Kilogram", abbreviation: "kg" },
    ];

    async function openUnitEditor() {
      const onCommit = vi.fn();
      render(
        <QuantityControl
          itemName="Beef shin"
          quantity={800}
          unitAbbreviation="g"
          obtained={false}
          units={units}
          unitId="u_g"
          onCommit={onCommit}
        />,
      );
      await userEvent.click(
        screen.getByRole("button", { name: "Edit quantity of Beef shin" }),
      );
      return { onCommit };
    }

    async function chooseUnit(name: string) {
      await userEvent.click(screen.getByRole("combobox", { name: "Unit" }));
      await userEvent.click(screen.getByRole("option", { name: name }));
    }

    it("offers No unit then the given units, starting on the current one", async () => {
      await openUnitEditor();

      const unit = screen.getByRole("combobox", { name: "Unit" });
      expect(unit).toHaveTextContent("g");
      await userEvent.click(unit);
      expect(
        screen.getAllByRole("option").map((option) => option.textContent),
      ).toEqual(["No unit", "Gramg", "Kilogramkg"]);
    });

    it("commits a changed unit, even with the quantity unchanged", async () => {
      const { onCommit } = await openUnitEditor();

      await chooseUnit("Kilogram");
      await userEvent.click(
        screen.getByRole("button", { name: "Confirm quantity" }),
      );

      expect(onCommit).toHaveBeenCalledWith(800, "u_kg");
    });

    it("commits the quantity and unit together", async () => {
      const { onCommit } = await openUnitEditor();

      await userEvent.keyboard("{Backspace>3}1");
      await chooseUnit("Kilogram");
      await userEvent.click(
        screen.getByRole("button", { name: "Confirm quantity" }),
      );

      expect(onCommit).toHaveBeenCalledWith(1, "u_kg");
    });

    it("reverts the unit on cancel", async () => {
      const { onCommit } = await openUnitEditor();

      await chooseUnit("No unit");
      // The open select hides the rest of the page until it finishes closing.
      await userEvent.click(
        await screen.findByRole("button", { name: "Cancel" }),
      );
      await userEvent.click(
        await screen.findByRole("button", {
          name: "Edit quantity of Beef shin",
        }),
      );

      expect(onCommit).not.toHaveBeenCalled();
      expect(screen.getByRole("combobox", { name: "Unit" })).toHaveTextContent(
        "g",
      );
    });
  });

  it("has no unit select without units, as on the shopping list", async () => {
    await openEditor(2);

    expect(
      screen.queryByRole("combobox", { name: "Unit" }),
    ).not.toBeInTheDocument();
  });
});
