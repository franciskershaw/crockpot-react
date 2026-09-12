import { useMenuEntry } from "@/features/menu/hooks/useMenuEntry";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { RecipeDetail } from "../types";
import { RecipeContent } from "./RecipeContent";

vi.mock("@/features/menu/hooks/useMenuEntry", () => ({
  useMenuEntry: vi.fn(),
}));

const mockUseMenuEntry = vi.mocked(useMenuEntry);

afterEach(() => {
  vi.clearAllMocks();
});

function recipe(overrides: Partial<RecipeDetail> = {}): RecipeDetail {
  return {
    id: "r_1",
    name: "Slow Cooker Beef Casserole",
    imageUrl: null,
    imageFilename: null,
    timeInMinutes: 360,
    serves: 4,
    approved: true,
    categories: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    isFavourite: false,
    matchedIngredientCount: 0,
    totalIngredientCount: 0,
    matchedCategoryCount: 0,
    score: 0,
    tier: null,
    description: null,
    instructions: ["Toss the beef in flour.", "Brown in batches."],
    notes: ["Freezes brilliantly."],
    ingredients: [],
    createdById: "u_1",
    createdByName: "Jamie",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("RecipeContent", () => {
  it("switches the mobile tab panel from ingredients to instructions+notes on click", async () => {
    mockUseMenuEntry.mockReturnValue({
      isInMenu: false,
      serves: undefined,
      isPending: false,
    });
    const user = userEvent.setup();
    render(<RecipeContent recipe={recipe()} />);

    // 1 copy = the always-mounted desktop version; Radix only mounts the active mobile tab.
    expect(screen.getAllByText("Toss the beef in flour.")).toHaveLength(1);

    await user.click(screen.getByRole("tab", { name: "Instructions (2)" }));

    expect(screen.getAllByText("Toss the beef in flour.")).toHaveLength(2);
    expect(screen.getAllByText("Freezes brilliantly.")).toHaveLength(2);
  });
});
