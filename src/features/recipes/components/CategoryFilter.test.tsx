import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CategoryFilter } from "./CategoryFilter";

const CATEGORIES = [{ id: "c1", name: "Veggie" }];

describe("CategoryFilter", () => {
  it("reflects the current mode and calls onModeChange when the other is clicked", async () => {
    const onModeChange = vi.fn();
    render(
      <CategoryFilter
        categories={CATEGORIES}
        selectedIds={[]}
        mode="include"
        onToggle={vi.fn()}
        onModeChange={onModeChange}
      />,
    );

    const includeButton = screen.getByRole("button", { name: "Include" });
    const excludeButton = screen.getByRole("button", { name: "Exclude" });
    expect(includeButton).toHaveAttribute("aria-pressed", "true");
    expect(excludeButton).toHaveAttribute("aria-pressed", "false");

    await userEvent.setup().click(excludeButton);
    expect(onModeChange).toHaveBeenCalledWith("exclude");
  });

  it("renders only one mode control per instance (no native radio name collisions)", () => {
    render(
      <CategoryFilter
        categories={CATEGORIES}
        selectedIds={[]}
        mode="include"
        onToggle={vi.fn()}
        onModeChange={vi.fn()}
      />,
    );

    expect(document.querySelectorAll('input[type="radio"]')).toHaveLength(0);
  });
});
