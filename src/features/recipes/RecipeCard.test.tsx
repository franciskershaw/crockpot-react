import { useAuth } from "@/features/auth/AuthContext";
import { renderWithProviders } from "@/test/renderWithProviders";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RecipeCard } from "./RecipeCard";
import type { RecipeCard as RecipeCardData } from "./types";
import { useToggleFavourite } from "./useToggleFavourite";

vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("./useToggleFavourite", () => ({
  useToggleFavourite: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseToggleFavourite = vi.mocked(useToggleFavourite);

afterEach(() => {
  vi.clearAllMocks();
});

function recipe(overrides: Partial<RecipeCardData> = {}): RecipeCardData {
  return {
    id: "r_1",
    name: "BBQ Pulled Pork",
    imageUrl: null,
    imageFilename: null,
    timeInMinutes: 320,
    serves: 12,
    approved: true,
    categories: [{ id: "c_1", name: "Batch" }],
    createdAt: "2026-01-01T00:00:00.000Z",
    isFavourite: false,
    ...overrides,
  };
}

describe("RecipeCard", () => {
  it("renders name, time, serves, and categories", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    mockUseToggleFavourite.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useToggleFavourite>);

    renderWithProviders(<RecipeCard recipe={recipe()} />);

    expect(screen.getByText("BBQ Pulled Pork")).toBeInTheDocument();
    expect(screen.getByText("320 mins")).toBeInTheDocument();
    expect(screen.getByText("Serves 12")).toBeInTheDocument();
    expect(screen.getByText("Batch")).toBeInTheDocument();
  });

  it("hides the favourite heart for an anonymous visitor", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    mockUseToggleFavourite.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useToggleFavourite>);

    renderWithProviders(<RecipeCard recipe={recipe()} />);

    expect(
      screen.queryByRole("button", { name: /favourites/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the heart and toggles favourite when logged in", async () => {
    const mutate = vi.fn();
    mockUseAuth.mockReturnValue({
      user: {
        id: "u_1",
        email: "jamie@example.com",
        name: "Jamie",
        image: null,
        role: "FREE",
      },
      isAuthenticated: true,
      isLoading: false,
    });
    mockUseToggleFavourite.mockReturnValue({
      mutate,
    } as unknown as ReturnType<typeof useToggleFavourite>);

    renderWithProviders(<RecipeCard recipe={recipe({ isFavourite: false })} />);

    const heart = screen.getByRole("button", { name: "Add to favourites" });
    await userEvent.setup().click(heart);

    expect(mutate).toHaveBeenCalledWith({
      recipeId: "r_1",
      wasFavourite: false,
    });
  });
});
