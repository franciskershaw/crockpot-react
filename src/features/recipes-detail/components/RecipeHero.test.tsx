import { useAuth } from "@/features/auth/components/AuthContext";
import { useAddToMenu } from "@/features/menu/hooks/useAddToMenu";
import { useMenuEntry } from "@/features/menu/hooks/useMenuEntry";
import { useRemoveFromMenu } from "@/features/menu/hooks/useRemoveFromMenu";
import { useUpdateMenuEntryServes } from "@/features/menu/hooks/useUpdateMenuEntryServes";
import type { RecipeDetail } from "@/features/recipes/data/types";
import { buildRecipeDetail } from "@/test/recipeFixtures";
import { renderWithProviders } from "@/test/renderWithProviders";
import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RecipeHero } from "./RecipeHero";

vi.mock("@/features/auth/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("@/features/menu/hooks/useMenuEntry", () => ({
  useMenuEntry: vi.fn(),
}));
vi.mock("@/features/menu/hooks/useAddToMenu", () => ({
  useAddToMenu: vi.fn(),
}));
vi.mock("@/features/menu/hooks/useUpdateMenuEntryServes", () => ({
  useUpdateMenuEntryServes: vi.fn(),
}));
vi.mock("@/features/menu/hooks/useRemoveFromMenu", () => ({
  useRemoveFromMenu: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseMenuEntry = vi.mocked(useMenuEntry);
const mockUseAddToMenu = vi.mocked(useAddToMenu);
const mockUseUpdateMenuEntryServes = vi.mocked(useUpdateMenuEntryServes);
const mockUseRemoveFromMenu = vi.mocked(useRemoveFromMenu);

afterEach(() => {
  vi.clearAllMocks();
});

function recipe(overrides: Partial<RecipeDetail> = {}): RecipeDetail {
  return buildRecipeDetail({
    name: "Slow Cooker Beef Casserole",
    timeInMinutes: 360,
    categories: [
      { id: "c_1", name: "Batch" },
      { id: "c_2", name: "Comfort" },
    ],
    createdByName: "Jamie M.",
    ...overrides,
  });
}

function setup({
  isAuthenticated = false,
  userId = "u_1",
  role = "FREE",
}: {
  isAuthenticated?: boolean;
  userId?: string;
  role?: "FREE" | "ADMIN";
} = {}) {
  mockUseAuth.mockReturnValue({
    isAuthenticated,
    isLoading: false,
    user: isAuthenticated
      ? {
          id: userId,
          email: "founder@example.com",
          name: "Founder",
          image: null,
          role,
        }
      : null,
  } as unknown as ReturnType<typeof useAuth>);
  mockUseMenuEntry.mockReturnValue({
    isInMenu: false,
    serves: undefined,
    isPending: false,
  });
  mockUseAddToMenu.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useAddToMenu>);
  mockUseUpdateMenuEntryServes.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateMenuEntryServes>);
  mockUseRemoveFromMenu.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useRemoveFromMenu>);
}

function renderHero(
  recipeData: RecipeDetail,
  { isStuck = false }: { isStuck?: boolean } = {},
) {
  return renderWithProviders(
    <RecipeHero recipe={recipeData} isStuck={isStuck} sentinelRef={() => {}} />,
  );
}

describe("RecipeHero", () => {
  it("renders the name, categories, and time/serves/by-line meta", () => {
    setup();
    renderHero(recipe());

    expect(
      screen.getByRole("heading", { name: "Slow Cooker Beef Casserole" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Batch")).toBeInTheDocument();
    expect(screen.getByText("Comfort")).toBeInTheDocument();
    expect(screen.getByText("360 mins")).toBeInTheDocument();
    expect(screen.getByText("Serves 4")).toBeInTheDocument();
    expect(screen.getByText("By Jamie M.")).toBeInTheDocument();
  });

  it("omits the categories row when the recipe has none", () => {
    setup();
    renderHero(recipe({ categories: [] }));

    expect(screen.queryByText("Batch")).not.toBeInTheDocument();
  });

  it("omits the by-line when createdByName is null", () => {
    setup();
    renderHero(recipe({ createdByName: null }));

    expect(screen.queryByText(/^By /)).not.toBeInTheDocument();
  });

  it("hides favourite, edit, delete and the Add to Menu CTA for an anonymous visitor", () => {
    setup({ isAuthenticated: false });
    renderHero(recipe());

    expect(
      screen.queryByRole("button", { name: /favourites/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Edit recipe" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete recipe" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add to menu" }),
    ).not.toBeInTheDocument();
  });

  it("shows favourite but not edit/delete for a logged-in non-owner", () => {
    setup({ isAuthenticated: true, userId: "someone_else", role: "FREE" });
    renderHero(recipe({ createdById: "u_1" }));

    // 2 copies: the natural row, and the always-mounted fixed bar (decision 5).
    expect(screen.getAllByRole("button", { name: /favourites/i })).toHaveLength(
      2,
    );
    expect(
      screen.queryByRole("link", { name: "Edit recipe" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete recipe" }),
    ).not.toBeInTheDocument();
  });

  it("shows edit and delete for the recipe's owner", () => {
    setup({ isAuthenticated: true, userId: "u_1", role: "FREE" });
    renderHero(recipe({ createdById: "u_1" }));

    expect(screen.getAllByRole("link", { name: "Edit recipe" })).toHaveLength(
      2,
    );
    expect(
      screen.getAllByRole("button", { name: "Delete recipe" }),
    ).toHaveLength(2);
  });

  it("shows edit and delete for an admin viewing someone else's recipe", () => {
    setup({ isAuthenticated: true, userId: "admin_1", role: "ADMIN" });
    renderHero(recipe({ createdById: "u_1" }));

    expect(screen.getAllByRole("link", { name: "Edit recipe" })).toHaveLength(
      2,
    );
    expect(
      screen.getAllByRole("button", { name: "Delete recipe" }),
    ).toHaveLength(2);
  });

  it("renders the Add to Menu CTA for an authenticated viewer", () => {
    setup({ isAuthenticated: true });
    renderHero(recipe());

    expect(screen.getAllByRole("button", { name: "Add to menu" })).toHaveLength(
      2,
    );
  });
});
