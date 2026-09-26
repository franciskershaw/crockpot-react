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

  it.each(["", "0", "-1", "abc"])(
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
});
