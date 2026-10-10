import { menuKeys } from "@/features/menu/data/queryKeys";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { recipeKeys } from "../data/queryKeys";
import { findCachedRecipeCard } from "./findCachedRecipeCard";

const pages = (...recipes: ReturnType<typeof buildRecipeCard>[]) => ({
  pages: [
    { recipes, page: 1, limit: 12, total: recipes.length, totalPages: 1 },
  ],
  pageParams: [1],
});

describe("findCachedRecipeCard", () => {
  it("finds a card in a cached browse or library list", () => {
    const client = new QueryClient();
    const card = buildRecipeCard({ id: "r_2", name: "Stew" });
    client.setQueryData(
      recipeKeys.list({ q: "stew" }),
      pages(buildRecipeCard({ id: "r_1" }), card),
    );

    expect(findCachedRecipeCard(client, "r_2")).toEqual(card);
  });

  it("finds a card in cached favourites", () => {
    const client = new QueryClient();
    const card = buildRecipeCard({ id: "r_3" });
    client.setQueryData(recipeKeys.favourites(), pages(card));

    expect(findCachedRecipeCard(client, "r_3")).toEqual(card);
  });

  it("finds a card in the cached menu", () => {
    const client = new QueryClient();
    const card = buildRecipeCard({ id: "r_4" });
    client.setQueryData(menuKeys.menu(), {
      entries: [{ recipeId: "r_4", serves: 2, recipe: card }],
    });

    expect(findCachedRecipeCard(client, "r_4")).toEqual(card);
  });

  it("returns undefined when no cached list holds the recipe", () => {
    const client = new QueryClient();
    client.setQueryData(
      recipeKeys.list({}),
      pages(buildRecipeCard({ id: "r_1" })),
    );

    expect(findCachedRecipeCard(client, "r_9")).toBeUndefined();
  });
});
