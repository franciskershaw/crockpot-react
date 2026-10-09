import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BottomSheet } from "./BottomSheet";

afterEach(() => {
  vi.restoreAllMocks();
});

function renderSheet(
  props: { header?: React.ReactNode; closeAtWidth?: number } = {},
) {
  const onOpenChange = vi.fn();
  render(
    <BottomSheet
      open
      onOpenChange={onOpenChange}
      title="Shopping list"
      description="Everything you need for your menu."
      closeLabel="Close shopping list"
      {...props}
    >
      <p>sheet content</p>
    </BottomSheet>,
  );
  return onOpenChange;
}

describe("BottomSheet", () => {
  it("shows its content in a dialog named by its title", () => {
    renderSheet();

    expect(
      screen.getByRole("dialog", { name: "Shopping list" }),
    ).toHaveTextContent("sheet content");
  });

  it("closes on Escape", async () => {
    const onOpenChange = renderSheet();

    await userEvent.keyboard("{Escape}");

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("only shows a close button alongside a header", () => {
    renderSheet();
    expect(
      screen.queryByRole("button", { name: "Close shopping list" }),
    ).not.toBeInTheDocument();
  });

  it("shows the header with a close button when given one", async () => {
    const onOpenChange = renderSheet({ header: <h2>Filters</h2> });

    expect(screen.getByText("Filters")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Close shopping list" }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes itself when the screen widens past mobile", () => {
    let onChange: ((event: MediaQueryListEvent) => void) | undefined;
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      addEventListener: (_: string, listener: typeof onChange) => {
        onChange = listener;
      },
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);
    const onOpenChange = renderSheet();

    expect(onChange).toBeDefined();
    onChange?.({ matches: true } as MediaQueryListEvent);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("watches the given width for closing itself", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);

    renderSheet({ closeAtWidth: 1024 });

    expect(matchMedia).toHaveBeenCalledWith("(min-width: 1024px)");
  });
});
