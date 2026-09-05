import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FilterOptionList } from "./FilterOptionList";

const SEVEN_OPTIONS = Array.from({ length: 7 }, (_, i) => ({
  id: `c${i + 1}`,
  name: `Category ${i + 1}`,
}));

describe("FilterOptionList", () => {
  it("shows only the first 6 options with a Show All (N more) toggle beyond that", () => {
    render(
      <FilterOptionList
        label="Categories"
        options={SEVEN_OPTIONS}
        selectedIds={[]}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByText("Category 1")).toBeInTheDocument();
    expect(screen.getByText("Category 6")).toBeInTheDocument();
    expect(screen.queryByText("Category 7")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show All (1 more)" }),
    ).toBeInTheDocument();
  });

  it("expands to show every option and flips the toggle to Hide", async () => {
    render(
      <FilterOptionList
        label="Categories"
        options={SEVEN_OPTIONS}
        selectedIds={[]}
        onToggle={vi.fn()}
      />,
    );

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Show All (1 more)" }));

    expect(screen.getByText("Category 7")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hide" })).toBeInTheDocument();
  });

  it("does not render a Show All toggle when 6 or fewer options exist", () => {
    render(
      <FilterOptionList
        label="Categories"
        options={SEVEN_OPTIONS.slice(0, 6)}
        selectedIds={[]}
        onToggle={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /show all/i }),
    ).not.toBeInTheDocument();
  });

  it("filters case-insensitively by the search-within-list input", async () => {
    render(
      <FilterOptionList
        label="Categories"
        options={SEVEN_OPTIONS}
        selectedIds={[]}
        onToggle={vi.fn()}
      />,
    );

    await userEvent
      .setup()
      .type(screen.getByPlaceholderText("Search categories..."), "gory 3");

    expect(screen.getByText("Category 3")).toBeInTheDocument();
    expect(screen.queryByText("Category 1")).not.toBeInTheDocument();
  });

  it("shows a 0 results message when the search matches nothing", async () => {
    render(
      <FilterOptionList
        label="Categories"
        options={SEVEN_OPTIONS}
        selectedIds={[]}
        onToggle={vi.fn()}
      />,
    );

    await userEvent
      .setup()
      .type(screen.getByPlaceholderText("Search categories..."), "zzz");

    expect(screen.getByText("0 results")).toBeInTheDocument();
  });

  it("reflects selectedIds and calls onToggle with the option id", async () => {
    const onToggle = vi.fn();
    render(
      <FilterOptionList
        label="Categories"
        options={SEVEN_OPTIONS}
        selectedIds={["c2"]}
        onToggle={onToggle}
      />,
    );

    const checkbox1 = screen.getByRole("checkbox", { name: "Category 1" });
    const checkbox2 = screen.getByRole("checkbox", { name: "Category 2" });
    expect(checkbox1).not.toBeChecked();
    expect(checkbox2).toBeChecked();

    await userEvent.setup().click(checkbox1);
    expect(onToggle).toHaveBeenCalledWith("c1");
  });
});
