import { useAuth } from "@/features/auth/components/AuthContext";
import { renderWithProviders } from "@/test/renderWithProviders";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useToggleFavourite } from "../hooks/useToggleFavourite";
import type { RecipeCard as RecipeCardData } from "../types";
import { RecipeCard, visibleMatchTier } from "./RecipeCard";

vi.mock("@/features/auth/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("../hooks/useToggleFavourite", () => ({
  useToggleFavourite: vi.fn(),
}));
vi.mock("./add-to-menu/AddToMenuButton", () => ({
  AddToMenuButton: () => <button>Mock Add To Menu</button>,
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
    matchedIngredientCount: 0,
    totalIngredientCount: 0,
    matchedCategoryCount: 0,
    score: 0,
    tier: null,
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

    renderWithProviders(<RecipeCard recipe={recipe()} from="/recipes" />);

    expect(screen.getByText("BBQ Pulled Pork")).toBeInTheDocument();
    expect(screen.getByText("320 mins")).toBeInTheDocument();
    expect(screen.getByText("Serves 12")).toBeInTheDocument();
    expect(screen.getByText("Batch")).toBeInTheDocument();
  });

  it("carries the caller's from through to the detail link, not a hardcoded value", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    mockUseToggleFavourite.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useToggleFavourite>);

    renderWithProviders(
      <RecipeCard recipe={recipe()} from="/recipes?categoryId=c1&q=chicken" />,
    );

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      `/recipes/r_1?${new URLSearchParams({ from: "/recipes?categoryId=c1&q=chicken" }).toString()}`,
    );
  });

  it("shows the add-to-menu button when logged in", () => {
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
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useToggleFavourite>);

    renderWithProviders(<RecipeCard recipe={recipe()} from="/recipes" />);

    expect(screen.getByText("Mock Add To Menu")).toBeInTheDocument();
  });

  it("hides the add-to-menu button for an anonymous visitor", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    mockUseToggleFavourite.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useToggleFavourite>);

    renderWithProviders(<RecipeCard recipe={recipe()} from="/recipes" />);

    expect(screen.queryByText("Mock Add To Menu")).not.toBeInTheDocument();
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

    renderWithProviders(<RecipeCard recipe={recipe()} from="/recipes" />);

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

    renderWithProviders(
      <RecipeCard recipe={recipe({ isFavourite: false })} from="/recipes" />,
    );

    const heart = screen.getByRole("button", { name: "Add to favourites" });
    await userEvent.setup().click(heart);

    expect(mutate).toHaveBeenCalledWith({
      recipeId: "r_1",
      wasFavourite: false,
    });
  });

  it("lazy-loads its image by default", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    mockUseToggleFavourite.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useToggleFavourite>);

    const { container } = renderWithProviders(
      <RecipeCard
        recipe={recipe({ imageUrl: "https://example.com/a.jpg" })}
        from="/recipes"
      />,
    );

    expect(container.querySelector("img")).toHaveAttribute("loading", "lazy");
  });

  it("loads its image eagerly when marked priority", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    mockUseToggleFavourite.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useToggleFavourite>);

    const { container } = renderWithProviders(
      <RecipeCard
        recipe={recipe({ imageUrl: "https://example.com/a.jpg" })}
        from="/recipes"
        priority
      />,
    );

    expect(container.querySelector("img")).toHaveAttribute("loading", "eager");
  });

  it("shows no star or chips when tier is null", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    mockUseToggleFavourite.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useToggleFavourite>);

    renderWithProviders(<RecipeCard recipe={recipe()} from="/recipes" />);

    expect(screen.queryByText(/Best Match|Good Match/)).not.toBeInTheDocument();
    expect(screen.queryByText(/matched/)).not.toBeInTheDocument();
  });

  it("shows the Best Match star when tier is best and selection isn't the single-category case", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    mockUseToggleFavourite.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useToggleFavourite>);

    renderWithProviders(
      <RecipeCard
        recipe={recipe({ tier: "best" })}
        from="/recipes"
        selectedCategoryCount={2}
      />,
    );

    expect(screen.getByText("Best Match")).toBeInTheDocument();
  });

  it("shows the Good Match star when tier is good and selection isn't the single-category case", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    mockUseToggleFavourite.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useToggleFavourite>);

    renderWithProviders(
      <RecipeCard
        recipe={recipe({ tier: "good" })}
        from="/recipes"
        selectedIngredientCount={1}
      />,
    );

    expect(screen.getByText("Good Match")).toBeInTheDocument();
  });

  it("suppresses the star when exactly one category is selected and no ingredients", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    mockUseToggleFavourite.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useToggleFavourite>);

    renderWithProviders(
      <RecipeCard
        recipe={recipe({ tier: "best", matchedCategoryCount: 1 })}
        from="/recipes"
        selectedCategoryCount={1}
        selectedIngredientCount={0}
      />,
    );

    expect(screen.queryByText(/Best Match|Good Match/)).not.toBeInTheDocument();
    expect(screen.getByText("1 category matched")).toBeInTheDocument();
  });

  it("shows the star when one category and one ingredient are both selected", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    mockUseToggleFavourite.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useToggleFavourite>);

    renderWithProviders(
      <RecipeCard
        recipe={recipe({ tier: "best" })}
        from="/recipes"
        selectedCategoryCount={1}
        selectedIngredientCount={1}
      />,
    );

    expect(screen.getByText("Best Match")).toBeInTheDocument();
  });

  it("shows the star when exactly one ingredient is selected and no categories", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    mockUseToggleFavourite.mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useToggleFavourite>);

    renderWithProviders(
      <RecipeCard
        recipe={recipe({ tier: "good" })}
        from="/recipes"
        selectedIngredientCount={1}
        selectedCategoryCount={0}
      />,
    );

    expect(screen.getByText("Good Match")).toBeInTheDocument();
  });

  it.each([
    [1, 1, "1 of 1 ingredient matched"],
    [1, 3, "1 of 3 ingredients matched"],
    [2, 5, "2 of 5 ingredients matched"],
  ])(
    "shows the ingredient-matched chip for %i of %i",
    (matchedIngredientCount, totalIngredientCount, expected) => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      mockUseToggleFavourite.mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof useToggleFavourite>);

      renderWithProviders(
        <RecipeCard
          recipe={recipe({ matchedIngredientCount, totalIngredientCount })}
          from="/recipes"
        />,
      );

      expect(screen.getByText(expected)).toBeInTheDocument();
    },
  );

  it.each([
    [1, "1 category matched"],
    [2, "2 categories matched"],
  ])(
    "shows the category-matched chip for a count of %i",
    (matchedCategoryCount, expected) => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      mockUseToggleFavourite.mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof useToggleFavourite>);

      renderWithProviders(
        <RecipeCard
          recipe={recipe({ matchedCategoryCount })}
          from="/recipes"
        />,
      );

      expect(screen.getByText(expected)).toBeInTheDocument();
    },
  );
});

describe("visibleMatchTier", () => {
  it("returns null when the recipe has no tier", () => {
    expect(visibleMatchTier(null, 0, 0)).toBeNull();
    expect(visibleMatchTier(null, 3, 3)).toBeNull();
  });

  it("suppresses a tier when exactly one category is selected and no ingredients", () => {
    expect(visibleMatchTier("best", 0, 1)).toBeNull();
    expect(visibleMatchTier("good", 0, 1)).toBeNull();
  });

  it("does not suppress when 2+ categories are selected, even with no ingredients", () => {
    expect(visibleMatchTier("best", 0, 2)).toBe("best");
  });

  it("does not suppress a single selected ingredient with no categories", () => {
    expect(visibleMatchTier("good", 1, 0)).toBe("good");
  });

  it("does not suppress a single category when an ingredient is also selected", () => {
    expect(visibleMatchTier("best", 1, 1)).toBe("best");
  });
});
