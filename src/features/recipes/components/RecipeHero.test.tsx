import { useAuth } from "@/features/auth/components/AuthContext";
import { useAddToMenu } from "@/features/menu/hooks/useAddToMenu";
import { useMenuEntry } from "@/features/menu/hooks/useMenuEntry";
import { useRemoveFromMenu } from "@/features/menu/hooks/useRemoveFromMenu";
import { useUpdateMenuEntryServes } from "@/features/menu/hooks/useUpdateMenuEntryServes";
import { renderWithProviders } from "@/test/renderWithProviders";
import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { RecipeDetail } from "../types";
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
  return {
    id: "r_1",
    name: "Slow Cooker Beef Casserole",
    imageUrl: null,
    imageFilename: null,
    timeInMinutes: 360,
    serves: 4,
    approved: true,
    categories: [
      { id: "c_1", name: "Batch" },
      { id: "c_2", name: "Comfort" },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    isFavourite: false,
    matchedIngredientCount: 0,
    totalIngredientCount: 0,
    matchedCategoryCount: 0,
    score: 0,
    tier: null,
    description: null,
    instructions: [],
    notes: [],
    ingredients: [],
    createdById: "u_1",
    createdByName: "Jamie M.",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
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

describe("RecipeHero", () => {
  it("renders the name, categories, and time/serves/by-line meta", () => {
    setup();
    renderWithProviders(<RecipeHero recipe={recipe()} />);

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
    renderWithProviders(<RecipeHero recipe={recipe({ categories: [] })} />);

    expect(screen.queryByText("Batch")).not.toBeInTheDocument();
  });

  it("omits the by-line when createdByName is null", () => {
    setup();
    renderWithProviders(
      <RecipeHero recipe={recipe({ createdByName: null })} />,
    );

    expect(screen.queryByText(/^By /)).not.toBeInTheDocument();
  });

  it("hides favourite, edit and delete for an anonymous visitor", () => {
    setup({ isAuthenticated: false });
    renderWithProviders(<RecipeHero recipe={recipe()} />);

    expect(
      screen.queryByRole("button", { name: /favourites/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Edit recipe" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete recipe" }),
    ).not.toBeInTheDocument();
  });

  it("shows favourite but not edit/delete for a logged-in non-owner", () => {
    setup({ isAuthenticated: true, userId: "someone_else", role: "FREE" });
    renderWithProviders(<RecipeHero recipe={recipe({ createdById: "u_1" })} />);

    expect(
      screen.getByRole("button", { name: /favourites/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Edit recipe" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete recipe" }),
    ).not.toBeInTheDocument();
  });

  it("shows edit and delete for the recipe's owner", () => {
    setup({ isAuthenticated: true, userId: "u_1", role: "FREE" });
    renderWithProviders(<RecipeHero recipe={recipe({ createdById: "u_1" })} />);

    expect(
      screen.getByRole("link", { name: "Edit recipe" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete recipe" }),
    ).toBeInTheDocument();
  });

  it("shows edit and delete for an admin viewing someone else's recipe", () => {
    setup({ isAuthenticated: true, userId: "admin_1", role: "ADMIN" });
    renderWithProviders(<RecipeHero recipe={recipe({ createdById: "u_1" })} />);

    expect(
      screen.getByRole("link", { name: "Edit recipe" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete recipe" }),
    ).toBeInTheDocument();
  });

  it("always renders the Add to Menu CTA", () => {
    setup();
    renderWithProviders(<RecipeHero recipe={recipe()} />);

    expect(
      screen.getByRole("button", { name: "Add to menu" }),
    ).toBeInTheDocument();
  });
});
