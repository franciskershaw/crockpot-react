import { menuKeys } from "@/features/menu/data/queryKeys";
import type { Menu } from "@/features/menu/data/types";
import { deferred, setupQueryClient } from "@/test/queryClientTestUtils";
import { buildRecipeCard, buildRecipeDetail } from "@/test/recipeFixtures";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { addFavourite, removeFavourite } from "../data/api";
import { recipeKeys } from "../data/queryKeys";
import type {
  RecipeCard,
  RecipeDetail,
  RecipeListResponse,
} from "../data/types";
import { useToggleFavourite } from "./useToggleFavourite";

vi.mock("../data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/api")>()),
  addFavourite: vi.fn(),
  removeFavourite: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockAddFavourite = vi.mocked(addFavourite);
const mockRemoveFavourite = vi.mocked(removeFavourite);

afterEach(() => {
  vi.clearAllMocks();
});

function page(recipes: RecipeCard[]): RecipeListResponse {
  return { recipes, page: 1, limit: 20, total: recipes.length, totalPages: 1 };
}

function setup(recipes: RecipeCard[]) {
  const queryKey = recipeKeys.list({});
  const { queryClient, wrapper } = setupQueryClient([
    [queryKey, { pages: [page(recipes)], pageParams: [1] }],
  ]);

  return { queryClient, queryKey, wrapper };
}

describe("useToggleFavourite", () => {
  it("optimistically flips isFavourite in the list cache before the request resolves", async () => {
    const { queryClient, queryKey, wrapper } = setup([
      buildRecipeCard({ id: "r_1", isFavourite: false }),
    ]);
    let resolveAdd: (v: { message: string }) => void;
    mockAddFavourite.mockReturnValue(
      new Promise((resolve) => {
        resolveAdd = resolve;
      }),
    );

    const { result } = renderHook(() => useToggleFavourite(), { wrapper });

    result.current.mutate({ recipeId: "r_1", wasFavourite: false });

    await waitFor(() => {
      const data = queryClient.getQueryData<{
        pages: RecipeListResponse[];
      }>(queryKey);
      expect(data?.pages[0].recipes[0].isFavourite).toBe(true);
    });

    expect(mockAddFavourite).toHaveBeenCalledWith("r_1");
    resolveAdd!({ message: "ok" });
  });

  it("calls removeFavourite when the recipe was already favourited", async () => {
    const { wrapper } = setup([
      buildRecipeCard({ id: "r_1", isFavourite: true }),
    ]);
    mockRemoveFavourite.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useToggleFavourite(), { wrapper });

    result.current.mutate({ recipeId: "r_1", wasFavourite: true });

    await waitFor(() =>
      expect(mockRemoveFavourite).toHaveBeenCalledWith("r_1"),
    );
  });

  it("rolls back the optimistic flip when the request fails", async () => {
    const { queryClient, queryKey, wrapper } = setup([
      buildRecipeCard({ id: "r_1", isFavourite: false }),
    ]);
    mockAddFavourite.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useToggleFavourite(), { wrapper });

    result.current.mutate({ recipeId: "r_1", wasFavourite: false });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const data = queryClient.getQueryData<{ pages: RecipeListResponse[] }>(
      queryKey,
    );
    expect(data?.pages[0].recipes[0].isFavourite).toBe(false);
  });

  it("optimistically flips isFavourite in the detail cache before the request resolves", async () => {
    const { queryClient, wrapper } = setup([]);
    const detailKey = recipeKeys.detail("r_1");
    queryClient.setQueryData(
      detailKey,
      buildRecipeDetail({ isFavourite: false }),
    );
    let resolveAdd: (v: { message: string }) => void;
    mockAddFavourite.mockReturnValue(
      new Promise((resolve) => {
        resolveAdd = resolve;
      }),
    );

    const { result } = renderHook(() => useToggleFavourite(), { wrapper });

    result.current.mutate({ recipeId: "r_1", wasFavourite: false });

    await waitFor(() => {
      expect(
        queryClient.getQueryData<RecipeDetail>(detailKey)?.isFavourite,
      ).toBe(true);
    });

    resolveAdd!({ message: "ok" });
  });

  it("rolls back the optimistic flip in the detail cache when the request fails", async () => {
    const { queryClient, wrapper } = setup([]);
    const detailKey = recipeKeys.detail("r_1");
    queryClient.setQueryData(
      detailKey,
      buildRecipeDetail({ isFavourite: false }),
    );
    let rejectAdd: (error: Error) => void;
    mockAddFavourite.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectAdd = reject;
      }),
    );

    const { result } = renderHook(() => useToggleFavourite(), { wrapper });

    result.current.mutate({ recipeId: "r_1", wasFavourite: false });

    // Prove the optimistic flip actually happened, not just that it's absent throughout.
    await waitFor(() => {
      expect(
        queryClient.getQueryData<RecipeDetail>(detailKey)?.isFavourite,
      ).toBe(true);
    });

    rejectAdd!(new Error("network error"));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData<RecipeDetail>(detailKey)?.isFavourite).toBe(
      false,
    );
  });

  it("leaves an unrelated recipe's detail cache untouched", async () => {
    const { queryClient, wrapper } = setup([]);
    const otherKey = recipeKeys.detail("r_2");
    queryClient.setQueryData(otherKey, buildRecipeDetail({ id: "r_2" }));
    mockAddFavourite.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useToggleFavourite(), { wrapper });

    result.current.mutate({ recipeId: "r_1", wasFavourite: false });

    await waitFor(() => expect(mockAddFavourite).toHaveBeenCalled());

    expect(queryClient.getQueryData<RecipeDetail>(otherKey)?.isFavourite).toBe(
      false,
    );
  });

  it("flips isFavourite on the menu's recipe cards too, and rolls it back on failure", async () => {
    const { queryClient, wrapper } = setup([]);
    queryClient.setQueryData<Menu>(menuKeys.menu(), {
      entries: [
        {
          recipeId: "r_1",
          serves: 4,
          recipe: buildRecipeCard({ id: "r_1", isFavourite: false }),
        },
        {
          recipeId: "r_2",
          serves: 2,
          recipe: buildRecipeCard({ id: "r_2", isFavourite: false }),
        },
      ],
    });
    let rejectAdd: (error: Error) => void = () => {};
    mockAddFavourite.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectAdd = reject;
      }),
    );
    const favourites = () =>
      queryClient
        .getQueryData<Menu>(menuKeys.menu())
        ?.entries.map((entry) => entry.recipe.isFavourite);

    const { result } = renderHook(() => useToggleFavourite(), { wrapper });
    result.current.mutate({ recipeId: "r_1", wasFavourite: false });

    await waitFor(() => expect(favourites()).toEqual([true, false]));

    rejectAdd(new Error("network error"));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(favourites()).toEqual([false, false]);
  });
});

describe("useToggleFavourite — favourites cache", () => {
  type FavouritesData = { pages: RecipeListResponse[]; pageParams: number[] };

  function favouritesData(pages: RecipeCard[][]): FavouritesData {
    const total = pages.reduce((sum, recipes) => sum + recipes.length, 0);
    return {
      pages: pages.map((recipes, index) => ({
        recipes,
        page: index + 1,
        limit: 12,
        total,
        totalPages: pages.length,
      })),
      pageParams: pages.map((_, index) => index + 1),
    };
  }

  function setupFavourites(pages: RecipeCard[][]) {
    const { queryClient, wrapper } = setupQueryClient([
      [recipeKeys.favourites(), favouritesData(pages)],
    ]);
    const favourites = () =>
      queryClient.getQueryData<FavouritesData>(recipeKeys.favourites());
    const ids = () =>
      favourites()?.pages.map((p) => p.recipes.map((recipe) => recipe.id));
    const totals = () => favourites()?.pages.map((p) => p.total);
    return { queryClient, wrapper, ids, totals };
  }

  const fav = (id: string) => buildRecipeCard({ id, isFavourite: true });

  it("removes an un-hearted recipe and lowers the total before the request resolves", async () => {
    const { wrapper, ids, totals } = setupFavourites([
      [fav("r_1"), fav("r_2")],
      [fav("r_3")],
    ]);
    const remove = deferred<{ message: string }>();
    mockRemoveFavourite.mockReturnValue(remove.promise);

    const { result } = renderHook(() => useToggleFavourite(), { wrapper });
    result.current.mutate({ recipeId: "r_2", wasFavourite: true });

    await waitFor(() => expect(ids()).toEqual([["r_1"], ["r_3"]]));
    expect(totals()).toEqual([2, 2]);
    remove.resolve({ message: "ok" });
  });

  it("puts a recipe back at its old position when un-hearting fails", async () => {
    const { wrapper, ids, totals } = setupFavourites([
      [fav("r_1"), fav("r_2")],
      [fav("r_3"), fav("r_4"), fav("r_5")],
    ]);
    const remove = deferred<{ message: string }>();
    mockRemoveFavourite.mockReturnValue(remove.promise);

    const { result } = renderHook(() => useToggleFavourite(), { wrapper });
    result.current.mutate({ recipeId: "r_4", wasFavourite: true });

    await waitFor(() =>
      expect(ids()).toEqual([
        ["r_1", "r_2"],
        ["r_3", "r_5"],
      ]),
    );

    remove.reject(new Error("network error"));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(ids()).toEqual([
      ["r_1", "r_2"],
      ["r_3", "r_4", "r_5"],
    ]);
    expect(totals()).toEqual([5, 5]);
  });

  it("leaves the favourites cache alone when the un-hearted recipe isn't in it", async () => {
    const { wrapper, ids, totals } = setupFavourites([[fav("r_1")]]);
    mockRemoveFavourite.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useToggleFavourite(), { wrapper });
    result.current.mutate({ recipeId: "r_9", wasFavourite: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ids()).toEqual([["r_1"]]);
    expect(totals()).toEqual([1]);
  });

  it("marks the favourites list stale once an un-heart settles, without refetching", async () => {
    const { queryClient, wrapper, ids } = setupFavourites([
      [fav("r_1"), fav("r_2")],
    ]);
    mockRemoveFavourite.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useToggleFavourite(), { wrapper });
    result.current.mutate({ recipeId: "r_1", wasFavourite: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      queryClient.getQueryState(recipeKeys.favourites())?.isInvalidated,
    ).toBe(true);
    expect(ids()).toEqual([["r_2"]]);
  });

  it("puts an undone recipe back at its old slot, and takes it out again if that fails", async () => {
    const { wrapper, ids, totals } = setupFavourites([
      [fav("r_1"), fav("r_2")],
      [fav("r_3"), fav("r_5")],
    ]);
    const add = deferred<{ message: string }>();
    mockAddFavourite.mockReturnValue(add.promise);

    const { result } = renderHook(() => useToggleFavourite(), { wrapper });
    result.current.mutate({
      recipeId: "r_4",
      wasFavourite: false,
      restoreAt: { recipe: fav("r_4"), index: 3 },
    });

    await waitFor(() =>
      expect(ids()).toEqual([
        ["r_1", "r_2"],
        ["r_3", "r_4", "r_5"],
      ]),
    );
    expect(totals()).toEqual([5, 5]);

    add.reject(new Error("network error"));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(ids()).toEqual([
      ["r_1", "r_2"],
      ["r_3", "r_5"],
    ]);
    expect(totals()).toEqual([4, 4]);
  });

  it("raises the total when a recipe is hearted elsewhere, and lowers it again if that fails", async () => {
    const { wrapper, totals } = setupFavourites([[fav("r_1")]]);
    const add = deferred<{ message: string }>();
    mockAddFavourite.mockReturnValue(add.promise);

    const { result } = renderHook(() => useToggleFavourite(), { wrapper });
    result.current.mutate({ recipeId: "r_2", wasFavourite: false });

    await waitFor(() => expect(totals()).toEqual([2]));

    add.reject(new Error("network error"));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(totals()).toEqual([1]);
  });

  it("counts as a favourite change while in flight", async () => {
    const { queryClient, wrapper } = setupFavourites([[fav("r_1")]]);
    const remove = deferred<{ message: string }>();
    mockRemoveFavourite.mockReturnValue(remove.promise);

    const { result } = renderHook(() => useToggleFavourite(), { wrapper });
    result.current.mutate({ recipeId: "r_1", wasFavourite: true });

    await waitFor(() =>
      expect(
        queryClient.isMutating({ mutationKey: recipeKeys.favouriteChange() }),
      ).toBe(1),
    );
    remove.resolve({ message: "ok" });
  });

  it("marks the favourites list stale when a recipe is hearted, without inserting it", async () => {
    const { queryClient, wrapper, ids } = setupFavourites([[fav("r_1")]]);
    mockAddFavourite.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useToggleFavourite(), { wrapper });
    result.current.mutate({ recipeId: "r_2", wasFavourite: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      queryClient.getQueryState(recipeKeys.favourites())?.isInvalidated,
    ).toBe(true);
    expect(ids()).toEqual([["r_1"]]);
  });
});
