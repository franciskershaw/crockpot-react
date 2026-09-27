import type { RecipeCard as RecipeCardData } from "@/features/recipes/data/types";
import { useToggleFavourite } from "@/features/recipes/hooks/useToggleFavourite";
import { UNDO_WINDOW_MS } from "@/lib/useUndoQueue";
import { FakeIntersectionObserver } from "@/test/fakeIntersectionObserver";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { MemoryRouter } from "react-router-dom";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { useFavourites } from "../hooks/useFavourites";
import { FavouritesPage } from "./FavouritesPage";

vi.mock("../hooks/useFavourites", () => ({ useFavourites: vi.fn() }));
vi.mock("@/features/recipes/hooks/useToggleFavourite", () => ({
  useToggleFavourite: vi.fn(),
}));
vi.mock("@/features/recipes/components/RecipeCard", () => ({
  RecipeCard: ({
    recipe,
    from,
    onUnfavourite,
  }: {
    recipe: RecipeCardData;
    from: string;
    onUnfavourite?: () => void;
  }) => (
    <div data-testid="recipe-card" data-from={from}>
      <span>{recipe.name}</span>
      <button type="button" onClick={() => onUnfavourite?.()}>
        Unfavourite {recipe.name}
      </button>
    </div>
  ),
}));
vi.mock("@/features/recipes/components/MobileRecipeRow", () => ({
  MobileRecipeRow: ({
    recipe,
    from,
    onUnfavourite,
  }: {
    recipe: RecipeCardData;
    from: string;
    onUnfavourite?: () => void;
  }) => (
    <div data-testid="mobile-row" data-from={from}>
      <span>{recipe.name}</span>
      <button type="button" onClick={() => onUnfavourite?.()}>
        Unfavourite {recipe.name} on mobile
      </button>
    </div>
  ),
}));

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});

afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const toggle = vi.fn();
const toggleAsync = vi.fn();
const loadMore = vi.fn();
const refetch = vi.fn();

beforeEach(() => {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  toggleAsync.mockResolvedValue({ message: "ok" });
  vi.mocked(useToggleFavourite).mockReturnValue({
    mutate: toggle,
    mutateAsync: toggleAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useToggleFavourite>);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function favourite(name: string) {
  return buildRecipeCard({ id: `id_${name}`, name, isFavourite: true });
}

function mockFavourites(
  pages: string[][] | null,
  state: {
    isError?: boolean;
    hasNextPage?: boolean;
    isFetching?: boolean;
    isFetchNextPageError?: boolean;
  } = {},
) {
  const total = pages?.flat().length ?? 0;
  vi.mocked(useFavourites).mockReturnValue({
    data:
      pages === null
        ? undefined
        : {
            pages: pages.map((names, i) => ({
              recipes: names.map(favourite),
              page: i + 1,
              limit: 12,
              total,
              totalPages: pages.length,
            })),
            pageParams: pages.map((_, i) => i + 1),
          },
    isError: false,
    hasNextPage: false,
    isFetching: false,
    isFetchNextPageError: false,
    changesInFlight: 0,
    refetch,
    loadMore,
    ...state,
  } as unknown as ReturnType<typeof useFavourites>);
}

const page = () => (
  <MemoryRouter>
    <FavouritesPage />
  </MemoryRouter>
);

function slotKinds(container: HTMLElement, recipeTestId: string) {
  return [
    ...container.querySelectorAll(`[data-testid="${recipeTestId}"], output`),
  ]
    .filter((slot) => !slot.closest("[inert]"))
    .map((slot) => (slot.tagName === "OUTPUT" ? "undo" : "recipe"));
}

function names(testId: string) {
  return screen
    .getAllByTestId(testId)
    .map((card) => card.querySelector("span")?.textContent);
}

describe("FavouritesPage", () => {
  it("shows every loaded favourite as a card, in order across pages", () => {
    mockFavourites([["Beef Casserole", "Fajita Wraps"], ["Pulled Pork"]]);
    render(page());

    expect(names("recipe-card")).toEqual([
      "Beef Casserole",
      "Fajita Wraps",
      "Pulled Pork",
    ]);
    expect(screen.getAllByTestId("recipe-card")[0]).toHaveAttribute(
      "data-from",
      "/favourites",
    );
  });

  it("shows each favourite as a compact row for mobile", () => {
    mockFavourites([["Beef Casserole", "Fajita Wraps"]]);
    render(page());

    expect(names("mobile-row")).toEqual(["Beef Casserole", "Fajita Wraps"]);
    expect(screen.getAllByTestId("mobile-row")[0]).toHaveAttribute(
      "data-from",
      "/favourites",
    );
  });

  it("shows the empty state, with a way to browse, when nothing is saved", () => {
    mockFavourites([[]]);
    render(page());

    expect(
      screen.getByRole("heading", { name: "No favourites yet" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Browse recipes" }),
    ).toHaveAttribute("href", "/recipes");
    expect(screen.queryByTestId("recipe-card")).not.toBeInTheDocument();
  });

  it("shows a loading skeleton, not the empty state, while loading", () => {
    mockFavourites(null);
    render(page());

    expect(screen.getByText("Loading your favourites…")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "No favourites yet" }),
    ).not.toBeInTheDocument();
  });

  it("offers a retry when the first load fails", async () => {
    mockFavourites(null, { isError: true });
    render(page());

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(refetch).toHaveBeenCalled();
  });

  it("keeps the list when a later refresh fails", () => {
    mockFavourites([["Beef Casserole"]], { isError: true });
    render(page());

    expect(names("recipe-card")).toEqual(["Beef Casserole"]);
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("puts an undo in the un-hearted card's place, and undo re-favourites it into that slot", async () => {
    mockFavourites([["Beef Casserole", "Fajita Wraps", "Pulled Pork"]]);
    const { rerender } = render(page());

    await userEvent.click(
      screen.getByRole("button", { name: "Unfavourite Fajita Wraps" }),
    );
    expect(toggleAsync).toHaveBeenCalledWith({
      recipeId: "id_Fajita Wraps",
      wasFavourite: true,
    });
    mockFavourites([["Beef Casserole", "Pulled Pork"]]);
    rerender(page());

    const grid = screen.getByTestId("favourites-grid");
    const undoTile = await within(grid).findByRole("status");
    expect(slotKinds(grid, "recipe-card")).toEqual([
      "recipe",
      "undo",
      "recipe",
    ]);
    expect(undoTile).toHaveTextContent("Removed Fajita Wraps");

    await userEvent.click(
      within(undoTile).getByRole("button", { name: "Undo" }),
    );

    expect(toggle).toHaveBeenLastCalledWith({
      recipeId: "id_Fajita Wraps",
      wasFavourite: false,
      restoreAt: {
        recipe: expect.objectContaining({ id: "id_Fajita Wraps" }),
        index: 1,
      },
    });
  });

  it("keeps a tile in place for each of several un-hearts", async () => {
    mockFavourites([
      ["Beef Casserole", "Fajita Wraps", "Pulled Pork", "Tacos"],
    ]);
    const { rerender } = render(page());

    await userEvent.click(
      screen.getByRole("button", { name: "Unfavourite Fajita Wraps" }),
    );
    mockFavourites([["Beef Casserole", "Pulled Pork", "Tacos"]]);
    rerender(page());
    await userEvent.click(
      screen.getByRole("button", { name: "Unfavourite Tacos" }),
    );
    mockFavourites([["Beef Casserole", "Pulled Pork"]]);
    rerender(page());

    const grid = screen.getByTestId("favourites-grid");
    await waitFor(() =>
      expect(slotKinds(grid, "recipe-card")).toEqual([
        "recipe",
        "undo",
        "recipe",
        "undo",
      ]),
    );
    expect(toggleAsync).toHaveBeenCalledTimes(2);
  });

  it("puts an undo in an un-hearted row's place on mobile too", async () => {
    mockFavourites([["Beef Casserole", "Fajita Wraps", "Pulled Pork"]]);
    const { rerender } = render(page());

    await userEvent.click(
      screen.getByRole("button", {
        name: "Unfavourite Fajita Wraps on mobile",
      }),
    );
    mockFavourites([["Beef Casserole", "Pulled Pork"]]);
    rerender(page());

    const list = screen.getByTestId("favourites-list");
    await within(list).findByRole("status");
    expect(slotKinds(list, "mobile-row")).toEqual(["recipe", "undo", "recipe"]);
  });

  it("shows the undo, not the empty state, after un-hearting the last favourite, then the empty state once it expires", async () => {
    mockFavourites([["Beef Casserole"]]);
    const { rerender } = render(page());

    vi.useFakeTimers({ shouldAdvanceTime: true });
    act(() =>
      screen
        .getByRole("button", { name: "Unfavourite Beef Casserole" })
        .click(),
    );
    mockFavourites([[]]);
    rerender(page());

    expect((await screen.findAllByRole("status")).length).toBeGreaterThan(0);
    expect(
      screen.queryByRole("heading", { name: "No favourites yet" }),
    ).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(UNDO_WINDOW_MS));

    expect(
      await screen.findByRole("heading", { name: "No favourites yet" }),
    ).toBeInTheDocument();
  });

  describe("loading more", () => {
    it("asks for more once the end of the list comes into view", () => {
      mockFavourites([["Beef Casserole"]], { hasNextPage: true });
      render(page());
      expect(loadMore).not.toHaveBeenCalled();

      FakeIntersectionObserver.setSentinelInView(true);

      expect(loadMore).toHaveBeenCalled();
    });

    it("doesn't retry a failed page while the end stays in view, but does once it comes back", () => {
      mockFavourites([["Beef Casserole"]], { hasNextPage: true });
      const { rerender } = render(page());
      FakeIntersectionObserver.setSentinelInView(true);
      expect(loadMore).toHaveBeenCalledTimes(1);

      mockFavourites([["Beef Casserole"]], {
        hasNextPage: true,
        isError: true,
        isFetchNextPageError: true,
      });
      rerender(page());
      expect(loadMore).toHaveBeenCalledTimes(1);

      FakeIntersectionObserver.setSentinelInView(false);
      FakeIntersectionObserver.setSentinelInView(true);
      expect(loadMore).toHaveBeenCalledTimes(2);
    });

    it("doesn't retry a failed refresh of a stale list while the end stays in view", () => {
      mockFavourites([["Beef Casserole"]], { hasNextPage: true });
      const { rerender } = render(page());
      FakeIntersectionObserver.setSentinelInView(true);
      mockFavourites([["Beef Casserole"]], {
        hasNextPage: true,
        isFetching: true,
      });
      rerender(page());
      const callsBeforeFailure = loadMore.mock.calls.length;

      mockFavourites([["Beef Casserole"]], {
        hasNextPage: true,
        isError: true,
      });
      rerender(page());
      expect(loadMore).toHaveBeenCalledTimes(callsBeforeFailure);

      FakeIntersectionObserver.setSentinelInView(false);
      FakeIntersectionObserver.setSentinelInView(true);
      expect(loadMore).toHaveBeenCalledTimes(callsBeforeFailure + 1);
    });
  });
});
