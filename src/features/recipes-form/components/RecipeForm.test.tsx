import { useAuth } from "@/features/auth/components/AuthContext";
import { useItemCategories } from "@/features/catalog/hooks/useItemCategories";
import { useItems } from "@/features/catalog/hooks/useItems";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { useRecipeCategories } from "@/features/recipes/hooks/useRecipeCategories";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, Link, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RecipeFormValues } from "../data/types";
import { defaultRecipeFormValues } from "../utils/recipeFormSchema";
import { RecipeForm } from "./RecipeForm";

vi.mock("@/features/auth/components/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("@/features/catalog/hooks/useItems", () => ({ useItems: vi.fn() }));
vi.mock("@/features/catalog/hooks/useItemCategories", () => ({
  useItemCategories: vi.fn(),
}));
vi.mock("@/features/catalog/hooks/useUnits", () => ({ useUnits: vi.fn() }));
vi.mock("@/features/recipes/hooks/useRecipeCategories", () => ({
  useRecipeCategories: vi.fn(),
}));

const complete: RecipeFormValues = {
  ...defaultRecipeFormValues,
  name: "Beef stew",
  categoryIds: ["c_dinner"],
  ingredients: [
    {
      itemId: "i_beef",
      itemName: "Beef",
      itemCategoryName: "Meat",
      unitId: null,
      quantity: "1",
    },
  ],
  instructions: "Brown the beef.",
};

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

function setup(
  onSubmit: (
    values: RecipeFormValues,
    done: (recipeId: string) => void,
  ) => void = vi.fn(),
) {
  const router = createMemoryRouter(
    [
      {
        path: "/recipes/new",
        element: (
          <>
            <Link to="/menu">Menu</Link>
            <RecipeForm
              title="Add a recipe"
              backTo="/recipes"
              defaultValues={complete}
              submitLabel="Publish recipe"
              pendingLabel="Publishing…"
              isPending={false}
              error={null}
              onSubmit={onSubmit}
            />
          </>
        ),
      },
      { path: "/menu", element: <p>menu page</p> },
      { path: "/recipes/:id", element: <p>recipe page</p> },
    ],
    { initialEntries: ["/recipes/new"] },
  );
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { user: userEvent.setup(), router };
}

const leaveDialog = () =>
  screen.queryByRole("dialog", { name: "Leave without saving?" });

describe("RecipeForm leave prompt", () => {
  it("lets you leave without asking when nothing has changed", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("link", { name: "Menu" }));

    expect(await screen.findByText("menu page")).toBeInTheDocument();
    expect(leaveDialog()).not.toBeInTheDocument();
  });

  it("asks before leaving unsaved changes, and Cancel keeps you editing", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText("Recipe name*"), " pie");

    await user.click(screen.getByRole("link", { name: "Menu" }));

    expect(await screen.findByRole("dialog")).toHaveAccessibleName(
      "Leave without saving?",
    );
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(leaveDialog()).not.toBeInTheDocument();
    expect(screen.getByLabelText("Recipe name*")).toHaveValue("Beef stew pie");
    expect(screen.queryByText("menu page")).not.toBeInTheDocument();
  });

  it("leaves, discarding the changes, once confirmed", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText("Recipe name*"), " pie");
    await user.click(screen.getByRole("link", { name: "Menu" }));

    await user.click(await screen.findByRole("button", { name: "Leave" }));

    expect(await screen.findByText("menu page")).toBeInTheDocument();
  });

  it("warns on reload or close only while there are unsaved changes", async () => {
    const { user } = setup();
    const unload = () => {
      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    };

    expect(unload()).toBe(false);
    await user.type(screen.getByLabelText("Recipe name*"), " pie");
    expect(unload()).toBe(true);
  });

  it("goes to the saved recipe without asking", async () => {
    const { user } = setup((_values, done) => done("r_saved"));
    await user.type(screen.getByLabelText("Recipe name*"), " pie");

    await user.click(screen.getByRole("button", { name: "Publish recipe" }));

    expect(await screen.findByText("recipe page")).toBeInTheDocument();
    expect(leaveDialog()).not.toBeInTheDocument();
  });
});
