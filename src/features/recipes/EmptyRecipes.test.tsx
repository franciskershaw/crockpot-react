import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EmptyRecipes } from "./EmptyRecipes";

describe("EmptyRecipes", () => {
  it("shows the unfiltered empty-catalog copy when no filters are active", () => {
    render(<EmptyRecipes activeFilterCount={0} onClearFilters={vi.fn()} />);

    expect(screen.getByText("No recipes yet")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /clear all filters/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the filtered no-results copy and a working clear-all when filters are active", async () => {
    const onClearFilters = vi.fn();
    render(
      <EmptyRecipes activeFilterCount={2} onClearFilters={onClearFilters} />,
    );

    expect(screen.getByText("No results")).toBeInTheDocument();
    expect(screen.getByText(/2 active filters/i)).toBeInTheDocument();

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /clear all filters/i }));

    expect(onClearFilters).toHaveBeenCalled();
  });

  it("uses singular filter copy for exactly one active filter", () => {
    render(<EmptyRecipes activeFilterCount={1} onClearFilters={vi.fn()} />);

    expect(screen.getByText(/1 active filter\b/i)).toBeInTheDocument();
  });
});
