import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useClearMenu } from "../hooks/useClearMenu";
import { MenuActionsMenu } from "./MenuActionsMenu";

vi.mock("../hooks/useClearMenu", () => ({ useClearMenu: vi.fn() }));

const clear = vi.fn();

beforeEach(() => {
  vi.mocked(useClearMenu).mockReturnValue({
    mutate: clear,
    isPending: false,
  } as unknown as ReturnType<typeof useClearMenu>);
});

afterEach(() => {
  vi.clearAllMocks();
});

async function chooseClearMenu() {
  render(<MenuActionsMenu />);
  await userEvent.click(
    screen.getByRole("button", { name: "More menu actions" }),
  );
  await userEvent.click(
    await screen.findByRole("menuitem", { name: "Clear menu" }),
  );
  return screen.findByRole("dialog");
}

describe("MenuActionsMenu", () => {
  it("asks for confirmation before clearing the menu", async () => {
    const dialog = await chooseClearMenu();
    expect(clear).not.toHaveBeenCalled();

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Clear menu" }),
    );

    expect(clear).toHaveBeenCalled();
  });

  it("doesn't clear when the confirmation is cancelled", async () => {
    const dialog = await chooseClearMenu();

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Cancel" }),
    );

    expect(clear).not.toHaveBeenCalled();
  });
});
