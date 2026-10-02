import { useAuth } from "@/features/auth/components/AuthContext";
import { useItemCategories } from "@/features/catalog/hooks/useItemCategories";
import { useItems } from "@/features/catalog/hooks/useItems";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { getRecipe } from "@/features/recipes/data/api";
import { useRecipeCategories } from "@/features/recipes/hooks/useRecipeCategories";
import { buildRecipeDetail } from "@/test/recipeFixtures";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EditRecipeRoute } from "./EditRecipePage";

vi.mock("@/features/auth/components/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("@/features/catalog/hooks/useItems", () => ({ useItems: vi.fn() }));
vi.mock("@/features/catalog/hooks/useItemCategories", () => ({
  useItemCategories: vi.fn(),
}));
vi.mock("@/features/catalog/hooks/useUnits", () => ({ useUnits: vi.fn() }));
vi.mock("@/features/recipes/hooks/useRecipeCategories", () => ({
  useRecipeCategories: vi.fn(),
}));
vi.mock("@/features/recipes/data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/recipes/data/api")>()),
  getRecipe: vi.fn(),
}));

const recipe = buildRecipeDetail({
  id: "r_stew",
  name: "Beef stew",
  createdById: "u_owner",
  approved: true,
  imageUrl: "https://res.cloudinary.com/crockpot/stew.jpg",
  imageFilename: "crockpot/stew",
  instructions: ["Brown the beef."],
});

function signInAs(id: string, role: "ADMIN" | "FREE") {
  vi.mocked(useAuth).mockReturnValue({
    user: { id, email: "cook@example.com", name: "Cook", image: null, role },
    isAuthenticated: true,
    isLoading: false,
  } as ReturnType<typeof useAuth>);
}

beforeEach(() => {
  for (const hook of [useItems, useItemCategories, useUnits]) {
    vi.mocked(hook).mockReturnValue({ data: [] } as never);
  }
  vi.mocked(useRecipeCategories).mockReturnValue({
    data: [],
  } as unknown as ReturnType<typeof useRecipeCategories>);
  vi.mocked(getRecipe).mockResolvedValue(recipe);
});

function renderEdit() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/recipes/r_stew/edit"]}>
        <Routes>
          <Route path="/recipes/:id/edit" element={<EditRecipeRoute />} />
          <Route path="/recipes/:id" element={<p>recipe detail page</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("EditRecipePage", () => {
  it("loads the recipe into the form, titled and labelled for editing", async () => {
    signInAs("u_owner", "FREE");
    renderEdit();

    expect(await screen.findByLabelText("Recipe name*")).toHaveValue(
      "Beef stew",
    );
    expect(getRecipe).toHaveBeenCalledWith("r_stew");
    expect(
      screen.getAllByRole("heading", { name: "Edit recipe" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toBeInTheDocument();
  });

  it("shows the existing photo, read-only", async () => {
    signInAs("u_owner", "FREE");
    renderEdit();

    const label = await screen.findByText("Photo");
    expect(label.parentElement?.querySelector("img")).toHaveAttribute(
      "src",
      "https://res.cloudinary.com/crockpot/stew.jpg",
    );
  });

  it("warns a non-admin owner that saving an approved recipe sends it back for approval", async () => {
    signInAs("u_owner", "FREE");
    renderEdit();

    expect(
      await screen.findByText("Saving sends this back for approval."),
    ).toBeInTheDocument();
  });

  it("doesn't warn an admin, whose edits stay approved", async () => {
    signInAs("u_admin", "ADMIN");
    renderEdit();

    await screen.findByLabelText("Recipe name*");
    expect(
      screen.queryByText("Saving sends this back for approval."),
    ).not.toBeInTheDocument();
  });

  it("sends anyone who can't manage the recipe to its page", async () => {
    signInAs("u_someone_else", "FREE");
    renderEdit();

    expect(await screen.findByText("recipe detail page")).toBeInTheDocument();
  });
});
