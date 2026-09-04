import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the initial value and placeholder", () => {
    render(<SearchBar value="pork" onChange={vi.fn()} />);

    expect(screen.getByRole("textbox")).toHaveValue("pork");
    expect(
      screen.getByPlaceholderText("Search recipes by name..."),
    ).toBeInTheDocument();
  });

  it("does not call onChange until 300ms of no typing has passed", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });
    render(<SearchBar value="" onChange={onChange} />);

    await user.type(screen.getByRole("textbox"), "chi");

    expect(onChange).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(300);

    expect(onChange).toHaveBeenCalledWith("chi");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("resets the debounce timer on every keystroke rather than firing per key", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });
    render(<SearchBar value="" onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "c");
    await vi.advanceTimersByTimeAsync(200);
    await user.type(input, "h");
    await vi.advanceTimersByTimeAsync(200);

    expect(onChange).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(300);

    expect(onChange).toHaveBeenCalledWith("ch");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("follows an external value change (e.g. Clear all)", () => {
    const { rerender } = render(<SearchBar value="pork" onChange={vi.fn()} />);
    expect(screen.getByRole("textbox")).toHaveValue("pork");

    rerender(<SearchBar value="" onChange={vi.fn()} />);
    expect(screen.getByRole("textbox")).toHaveValue("");
  });
});
