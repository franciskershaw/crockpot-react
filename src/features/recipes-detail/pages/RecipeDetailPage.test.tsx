import { useAuth } from "@/features/auth/components/AuthContext";
import { useAddToMenu } from "@/features/menu/hooks/useAddToMenu";
import { useMenuEntry } from "@/features/menu/hooks/useMenuEntry";
import { useRemoveFromMenu } from "@/features/menu/hooks/useRemoveFromMenu";
import { useUpdateMenuEntryServes } from "@/features/menu/hooks/useUpdateMenuEntryServes";
import { approveRecipe, getRecipe } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import type { RecipeDetail } from "@/features/recipes/data/types";
import { ApiError } from "@/lib/http/client";
import { buildUser } from "@/test/authFixtures";
import { renderWithQueryClient } from "@/test/queryClientTestUtils";
import { buildRecipeCard, buildRecipeDetail } from "@/test/recipeFixtures";
import { renderWithProviders } from "@/test/renderWithProviders";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RecipeDetailPage, RecipeDetailRoute } from "./RecipeDetailPage";

vi.mock("@/features/recipes/data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/recipes/data/api")>()),
  getRecipe: vi.fn(),
  approveRecipe: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
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

const mockGetRecipe = vi.mocked(getRecipe);
const mockUseAuth = vi.mocked(useAuth);
const mockUseMenuEntry = vi.mocked(useMenuEntry);
const mockUseAddToMenu = vi.mocked(useAddToMenu);
const mockUseUpdateMenuEntryServes = vi.mocked(useUpdateMenuEntryServes);
const mockUseRemoveFromMenu = vi.mocked(useRemoveFromMenu);

afterEach(() => {
  vi.clearAllMocks();
});

function setupMenuAndAuth(
  authOverrides: Partial<ReturnType<typeof useAuth>> = {},
) {
  mockUseAuth.mockReturnValue({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    ...authOverrides,
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

describe("RecipeDetailPage", () => {
  it("shows a loading skeleton while the recipe is loading, then swaps to the recipe", async () => {
    setupMenuAndAuth();
    let resolveRecipe: (recipe: RecipeDetail) => void;
    mockGetRecipe.mockReturnValue(
      new Promise((resolve) => {
        resolveRecipe = resolve;
      }),
    );

    renderWithProviders(<RecipeDetailPage recipeId="r_1" />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("BBQ Pulled Pork")).not.toBeInTheDocument();

    resolveRecipe!(buildRecipeDetail({ name: "BBQ Pulled Pork" }));

    expect(await screen.findByText("BBQ Pulled Pork")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows the hero from the cached card at once while the full recipe loads", async () => {
    setupMenuAndAuth();
    let resolveRecipe: (recipe: RecipeDetail) => void;
    mockGetRecipe.mockReturnValue(
      new Promise((resolve) => {
        resolveRecipe = resolve;
      }),
    );
    const card = buildRecipeCard({
      id: "r_1",
      name: "BBQ Pulled Pork",
      approved: true,
      createdByName: "Jamie M.",
    });

    renderWithQueryClient(<RecipeDetailPage recipeId="r_1" />, {
      seed: [
        [
          recipeKeys.list({}),
          {
            pages: [
              { recipes: [card], page: 1, limit: 12, total: 1, totalPages: 1 },
            ],
            pageParams: [1],
          },
        ],
      ],
    });

    expect(
      screen.getByRole("heading", { name: "BBQ Pulled Pork" }),
    ).toBeInTheDocument();
    expect(screen.getByText("By Jamie M.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();

    resolveRecipe!(
      buildRecipeDetail({
        id: "r_1",
        name: "BBQ Pulled Pork",
        description: "Smoky and slow.",
      }),
    );

    expect(await screen.findByText("Smoky and slow.")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("titles the tab with the cached card's name before the full recipe loads", () => {
    setupMenuAndAuth();
    mockGetRecipe.mockReturnValue(new Promise(() => {}));
    const card = buildRecipeCard({
      id: "r_1",
      name: "BBQ Pulled Pork",
      approved: true,
    });

    renderWithQueryClient(<RecipeDetailPage recipeId="r_1" />, {
      seed: [
        [
          recipeKeys.list({}),
          {
            pages: [
              { recipes: [card], page: 1, limit: 12, total: 1, totalPages: 1 },
            ],
            pageParams: [1],
          },
        ],
      ],
    });

    expect(document.title).toBe("BBQ Pulled Pork | Crockpot");
  });

  it("sets no title of its own on a direct visit until the recipe loads, then the recipe's name", async () => {
    setupMenuAndAuth();
    let resolveRecipe: (recipe: RecipeDetail) => void;
    mockGetRecipe.mockReturnValue(
      new Promise((resolve) => {
        resolveRecipe = resolve;
      }),
    );

    renderWithProviders(<RecipeDetailPage recipeId="r_1" />);

    expect(document.querySelector("title")).toBeNull();

    resolveRecipe!(buildRecipeDetail({ name: "BBQ Pulled Pork" }));

    await screen.findByText("BBQ Pulled Pork");
    expect(document.title).toBe("BBQ Pulled Pork | Crockpot");
  });

  it("waits for the full recipe when the cached card is pending approval", () => {
    setupMenuAndAuth();
    mockGetRecipe.mockReturnValue(new Promise(() => {}));
    const card = buildRecipeCard({
      id: "r_1",
      name: "BBQ Pulled Pork",
      approved: false,
    });

    renderWithQueryClient(<RecipeDetailPage recipeId="r_1" />, {
      seed: [
        [
          recipeKeys.list({}),
          {
            pages: [
              { recipes: [card], page: 1, limit: 12, total: 1, totalPages: 1 },
            ],
            pageParams: [1],
          },
        ],
      ],
    });

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("BBQ Pulled Pork")).not.toBeInTheDocument();
  });

  it("renders the recipe once it loads", async () => {
    setupMenuAndAuth();
    mockGetRecipe.mockResolvedValue(
      buildRecipeDetail({ name: "BBQ Pulled Pork" }),
    );

    renderWithProviders(<RecipeDetailPage recipeId="r_1" />);

    expect(await screen.findByText("BBQ Pulled Pork")).toBeInTheDocument();
    expect(mockGetRecipe).toHaveBeenCalledWith("r_1");
  });

  it("renders a back-to-recipes control once loaded", async () => {
    setupMenuAndAuth();
    mockGetRecipe.mockResolvedValue(buildRecipeDetail());

    renderWithProviders(<RecipeDetailPage recipeId="r_1" />);

    expect(
      (await screen.findAllByRole("link", { name: /back to recipes/i })).length,
    ).toBeGreaterThan(0);
  });

  it("shows the pending-approval banner to the recipe's own creator when unapproved", async () => {
    setupMenuAndAuth({
      isAuthenticated: true,
      user: buildUser(),
    });
    mockGetRecipe.mockResolvedValue(
      buildRecipeDetail({ createdById: "u_1", approved: false }),
    );

    renderWithProviders(<RecipeDetailPage recipeId="r_1" />);

    expect(await screen.findByText(/pending approval/i)).toBeInTheDocument();
  });

  it("hides the pending-approval banner once the recipe is approved", async () => {
    setupMenuAndAuth({
      isAuthenticated: true,
      user: buildUser(),
    });
    mockGetRecipe.mockResolvedValue(
      buildRecipeDetail({ createdById: "u_1", approved: true }),
    );

    renderWithProviders(<RecipeDetailPage recipeId="r_1" />);

    await screen.findByText("BBQ Pulled Pork");
    expect(screen.queryByText(/pending approval/i)).not.toBeInTheDocument();
  });

  it("hides the pending-approval banner from a viewer who isn't the creator, even if unapproved", async () => {
    setupMenuAndAuth({
      isAuthenticated: true,
      user: buildUser({
        id: "someone_else",
        email: "sam@example.com",
        name: "Sam",
      }),
    });
    mockGetRecipe.mockResolvedValue(
      buildRecipeDetail({ createdById: "u_1", approved: false }),
    );

    renderWithProviders(<RecipeDetailPage recipeId="r_1" />);

    await screen.findByText("BBQ Pulled Pork");
    expect(screen.queryByText(/pending approval/i)).not.toBeInTheDocument();
  });

  it("renders the description only when the recipe has one", async () => {
    setupMenuAndAuth();
    mockGetRecipe.mockResolvedValue(
      buildRecipeDetail({ description: "A freezer-stash regular." }),
    );

    renderWithProviders(<RecipeDetailPage recipeId="r_1" />);

    expect(
      await screen.findByText("A freezer-stash regular."),
    ).toBeInTheDocument();
  });

  it("omits the description section when the recipe has none", async () => {
    setupMenuAndAuth();
    mockGetRecipe.mockResolvedValue(buildRecipeDetail({ description: null }));

    renderWithProviders(<RecipeDetailPage recipeId="r_1" />);

    await screen.findByText("BBQ Pulled Pork");
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("shows a not-found panel for a 404, with a link back to recipes", async () => {
    const { ApiError } = await import("@/lib/http/client");
    mockGetRecipe.mockRejectedValue(new ApiError(404, "not_found"));

    renderWithProviders(<RecipeDetailPage recipeId="missing" />);

    expect(await screen.findByText("Recipe not found")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to recipes/i }),
    ).toHaveAttribute("href", "/recipes");
    expect(document.title).toBe("Recipe not found | Crockpot");
  });

  it("shows a generic error panel with retry for a non-404 failure", async () => {
    const { ApiError } = await import("@/lib/http/client");
    mockGetRecipe.mockRejectedValue(new ApiError(500, "server_error"));

    renderWithProviders(<RecipeDetailPage recipeId="r_1" />);

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();

    mockGetRecipe.mockResolvedValue(buildRecipeDetail());
    await userEvent.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => expect(mockGetRecipe).toHaveBeenCalledTimes(2));
  });

  it("starts the next recipe's approval afresh, even when it's already cached", async () => {
    setupMenuAndAuth({
      isAuthenticated: true,
      user: buildUser({ id: "u_admin", role: "ADMIN" }),
    });
    const stew = buildRecipeDetail({
      id: "r_a",
      name: "Stew",
      approved: false,
    });
    const pie = buildRecipeDetail({ id: "r_b", name: "Pie", approved: false });
    mockGetRecipe.mockImplementation(async (id) => (id === "r_b" ? pie : stew));
    vi.mocked(approveRecipe).mockRejectedValue(
      new ApiError(409, "recipe_changed"),
    );
    renderWithQueryClient(
      <>
        <Link to="/recipes/r_b">next recipe</Link>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailRoute />} />
        </Routes>
      </>,
      { route: "/recipes/r_a", seed: [[recipeKeys.detail("r_b"), pie]] },
    );
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "Approve" }));
    await screen.findByText(
      "This recipe changed since you opened it — check it again",
    );
    await user.click(screen.getByRole("link", { name: "next recipe" }));

    expect((await screen.findAllByText("Pie")).length).toBeGreaterThan(0);
    expect(
      screen.queryByText(
        "This recipe changed since you opened it — check it again",
      ),
    ).not.toBeInTheDocument();
  });
});
