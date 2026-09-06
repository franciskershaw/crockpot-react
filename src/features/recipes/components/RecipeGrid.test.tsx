import { renderWithProviders } from "@/test/renderWithProviders";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { listRecipes } from "../api";
import { RecipeGrid } from "./RecipeGrid";

vi.mock("../api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api")>()),
  listRecipes: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockListRecipes = vi.mocked(listRecipes);

afterEach(() => {
  vi.clearAllMocks();
});

describe("RecipeGrid", () => {
  it("shows a retry affordance when the list fails to load, and refetches on click", async () => {
    mockListRecipes.mockRejectedValue(new Error("network down"));

    renderWithProviders(
      <RecipeGrid params={{}} activeFilterCount={0} onClearFilters={vi.fn()} />,
    );

    await waitFor(() =>
      expect(screen.getByText("Something went wrong")).toBeInTheDocument(),
    );
    expect(mockListRecipes).toHaveBeenCalledTimes(1);

    mockListRecipes.mockResolvedValue({
      recipes: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    });

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => expect(mockListRecipes).toHaveBeenCalledTimes(2));
  });
});
