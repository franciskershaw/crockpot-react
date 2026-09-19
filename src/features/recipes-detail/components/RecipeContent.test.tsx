import { useMenuEntry } from "@/features/menu/hooks/useMenuEntry";
import type { RecipeDetail } from "@/features/recipes/data/types";
import { buildRecipeDetail } from "@/test/recipeFixtures";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RecipeContent } from "./RecipeContent";

vi.mock("@/features/menu/hooks/useMenuEntry", () => ({
  useMenuEntry: vi.fn(),
}));

const mockUseMenuEntry = vi.mocked(useMenuEntry);

afterEach(() => {
  vi.clearAllMocks();
});

function recipe(overrides: Partial<RecipeDetail> = {}): RecipeDetail {
  return buildRecipeDetail({
    name: "Slow Cooker Beef Casserole",
    timeInMinutes: 360,
    instructions: ["Toss the beef in flour.", "Brown in batches."],
    notes: ["Freezes brilliantly."],
    ...overrides,
  });
}

describe("RecipeContent", () => {
  it("switches the mobile tab panel from ingredients to instructions+notes on click", async () => {
    mockUseMenuEntry.mockReturnValue({
      isInMenu: false,
      serves: undefined,
      isPending: false,
    });
    const user = userEvent.setup();
    render(<RecipeContent recipe={recipe()} isStuck={false} />);

    // 1 copy = the always-mounted desktop version; Radix only mounts the active mobile tab.
    expect(screen.getAllByText("Toss the beef in flour.")).toHaveLength(1);

    // 2 tabs named "Instructions (2)": the real one and the always-mounted fixed duplicate (decision 5); click the real, currently-visible one.
    const [realInstructionsTab] = screen.getAllByRole("tab", {
      name: "Instructions (2)",
    });
    await user.click(realInstructionsTab);

    expect(screen.getAllByText("Toss the beef in flour.")).toHaveLength(2);
    expect(screen.getAllByText("Freezes brilliantly.")).toHaveLength(2);
  });
});
