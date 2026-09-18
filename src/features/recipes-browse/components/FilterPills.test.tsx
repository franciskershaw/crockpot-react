import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FilterPills } from "./FilterPills";

const CATEGORIES = [
  { id: "c1", name: "Veggie" },
  { id: "c2", name: "Chicken" },
];
const INGREDIENTS = [
  { id: "i1", name: "Garlic", categoryId: "ic1", allowedUnitIds: [] },
];

function baseProps() {
  return {
    categoryIds: [],
    categoryMode: "include" as const,
    categories: CATEGORIES,
    ingredientIds: [],
    ingredients: INGREDIENTS,
    minTime: undefined,
    maxTime: undefined,
    onRemoveCategory: vi.fn(),
    onRemoveIngredient: vi.fn(),
    onRemoveTimeRange: vi.fn(),
  };
}

describe("FilterPills", () => {
  it("renders nothing when no filters are active", () => {
    const { container } = render(<FilterPills {...baseProps()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a time pill, falling back to 0/∞ for an open-ended bound", () => {
    render(<FilterPills {...baseProps()} minTime={20} />);
    expect(screen.getByText("Time: 20-∞ min")).toBeInTheDocument();
  });

  it("renders a full time range pill when both bounds are set", () => {
    render(<FilterPills {...baseProps()} minTime={20} maxTime={75} />);
    expect(screen.getByText("Time: 20-75 min")).toBeInTheDocument();
  });

  it("renders a plain category pill in include mode", () => {
    render(
      <FilterPills
        {...baseProps()}
        categoryIds={["c1"]}
        categoryMode="include"
      />,
    );
    expect(screen.getByText("Veggie")).toBeInTheDocument();
  });

  it("prefixes an excluded category pill with Not", () => {
    render(
      <FilterPills
        {...baseProps()}
        categoryIds={["c1"]}
        categoryMode="exclude"
      />,
    );
    expect(screen.getByText("Not Veggie")).toBeInTheDocument();
  });

  it("renders an ingredient pill", () => {
    render(<FilterPills {...baseProps()} ingredientIds={["i1"]} />);
    expect(screen.getByText("Garlic")).toBeInTheDocument();
  });

  it("skips an id that isn't in the lookup list yet (reference data still loading)", () => {
    render(<FilterPills {...baseProps()} categoryIds={["unknown-id"]} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("removing a category pill calls onRemoveCategory with its id", async () => {
    const onRemoveCategory = vi.fn();
    render(
      <FilterPills
        {...baseProps()}
        categoryIds={["c1"]}
        onRemoveCategory={onRemoveCategory}
      />,
    );

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /Veggie/i }));
    expect(onRemoveCategory).toHaveBeenCalledWith("c1");
  });
});
