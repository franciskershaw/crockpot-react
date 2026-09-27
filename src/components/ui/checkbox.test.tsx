import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("toggles with the Enter key", async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Onions" onCheckedChange={onCheckedChange} />);

    screen.getByRole("checkbox", { name: "Onions" }).focus();
    await userEvent.keyboard("{Enter}");

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("still toggles with the Space key", async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Onions" onCheckedChange={onCheckedChange} />);

    screen.getByRole("checkbox", { name: "Onions" }).focus();
    await userEvent.keyboard(" ");

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});
