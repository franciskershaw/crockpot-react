import { useAuth } from "@/features/auth/components/AuthContext";
import { useItemCategories } from "@/features/catalog/hooks/useItemCategories";
import { useItems } from "@/features/catalog/hooks/useItems";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { useRecipeCategories } from "@/features/recipes/hooks/useRecipeCategories";
import { renderWithProviders } from "@/test/renderWithProviders";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RecipeFormPage } from "./RecipeFormPage";

vi.mock("@/features/auth/components/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("@/features/catalog/hooks/useItems", () => ({ useItems: vi.fn() }));
vi.mock("@/features/catalog/hooks/useItemCategories", () => ({
  useItemCategories: vi.fn(),
}));
vi.mock("@/features/catalog/hooks/useUnits", () => ({ useUnits: vi.fn() }));
vi.mock("@/features/recipes/hooks/useRecipeCategories", () => ({
  useRecipeCategories: vi.fn(),
}));

const GAPS = [
  "Give the recipe a name.",
  "Pick at least one category.",
  "Add at least one ingredient.",
  "Add at least one step.",
];

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    isAuthenticated: true,
    isLoading: false,
  } as unknown as ReturnType<typeof useAuth>);
  for (const hook of [useItems, useItemCategories, useUnits]) {
    vi.mocked(hook).mockReturnValue({ data: [] } as never);
  }
  vi.mocked(useRecipeCategories).mockReturnValue({
    data: [{ id: "c_dinner", name: "Dinner" }],
  } as unknown as ReturnType<typeof useRecipeCategories>);
});

function setup() {
  const user = userEvent.setup();
  renderWithProviders(<RecipeFormPage />);
  const publish = () =>
    user.click(screen.getByRole("button", { name: "Publish recipe" }));
  return { user, publish };
}

describe("RecipeFormPage", () => {
  it("shows no errors before the first publish", async () => {
    const { user } = setup();

    await user.type(screen.getByLabelText("Recipe name*"), "ab");
    await user.clear(screen.getByLabelText("Recipe name*"));

    for (const gap of GAPS) {
      expect(screen.queryByText(gap)).not.toBeInTheDocument();
    }
  });

  it("keeps the footer's publish status live as the form fills in", async () => {
    const { user } = setup();
    expect(
      screen.getByText(
        "Name, categories, ingredients and one step needed to publish",
      ),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("Recipe name*"), "Stew");

    expect(
      screen.getByText(
        "Categories, ingredients and one step needed to publish",
      ),
    ).toBeInTheDocument();
  });

  it("publishing an empty form shows every gap and focuses the name", async () => {
    const { publish } = setup();

    await publish();

    for (const gap of GAPS) {
      expect(await screen.findByText(gap)).toBeInTheDocument();
    }
    expect(screen.getByLabelText("Recipe name*")).toHaveFocus();
  });

  it("clears a field's error as soon as it's fixed after a publish", async () => {
    const { user, publish } = setup();
    await publish();
    await screen.findByText("Give the recipe a name.");

    await user.type(screen.getByLabelText("Recipe name*"), "Stew");
    await user.click(screen.getByRole("button", { name: /Add category/ }));
    await user.click(screen.getByRole("checkbox", { name: "Dinner" }));
    await user.type(
      screen.getByLabelText("Instructions, one step per line"),
      "Brown the beef.",
    );

    expect(
      screen.queryByText("Give the recipe a name."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Pick at least one category."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Add at least one step."),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Add at least one ingredient."),
    ).toBeInTheDocument();
  });
});
