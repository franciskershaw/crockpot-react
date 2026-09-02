import { describe, expect, it } from "vitest";

import { buildRecipeListSearchParams } from "./api";

describe("buildRecipeListSearchParams", () => {
  it("returns an empty search for no params", () => {
    expect(buildRecipeListSearchParams({}).toString()).toBe("");
  });

  it("sets a trimmed q", () => {
    const search = buildRecipeListSearchParams({ q: "  beef  " });
    expect(search.get("q")).toBe("beef");
  });

  it("ignores a blank q", () => {
    const search = buildRecipeListSearchParams({ q: "   " });
    expect(search.has("q")).toBe(false);
  });

  it("repeats categoryId and omits categoryMode when not given", () => {
    const search = buildRecipeListSearchParams({
      categoryIds: ["cat-1", "cat-2"],
    });
    expect(search.getAll("categoryId")).toEqual(["cat-1", "cat-2"]);
    expect(search.has("categoryMode")).toBe(false);
  });

  it("sets categoryMode alongside categoryIds", () => {
    const search = buildRecipeListSearchParams({
      categoryIds: ["cat-1"],
      categoryMode: "exclude",
    });
    expect(search.get("categoryMode")).toBe("exclude");
  });

  it("ignores categoryMode with no categoryIds", () => {
    const search = buildRecipeListSearchParams({ categoryMode: "exclude" });
    expect(search.has("categoryMode")).toBe(false);
  });

  it("repeats ingredientId", () => {
    const search = buildRecipeListSearchParams({
      ingredientIds: ["item-1", "item-2"],
    });
    expect(search.getAll("ingredientId")).toEqual(["item-1", "item-2"]);
  });

  it("sets minTime, maxTime, page, and limit", () => {
    const search = buildRecipeListSearchParams({
      minTime: 20,
      maxTime: 90,
      page: 2,
      limit: 12,
    });
    expect(search.get("minTime")).toBe("20");
    expect(search.get("maxTime")).toBe("90");
    expect(search.get("page")).toBe("2");
    expect(search.get("limit")).toBe("12");
  });

  it("combines every param together", () => {
    const search = buildRecipeListSearchParams({
      q: "chicken",
      categoryIds: ["cat-1"],
      categoryMode: "include",
      ingredientIds: ["item-1"],
      minTime: 10,
      maxTime: 60,
      page: 1,
      limit: 20,
    });
    expect(search.toString()).toBe(
      "q=chicken&categoryId=cat-1&categoryMode=include&ingredientId=item-1&minTime=10&maxTime=60&page=1&limit=20",
    );
  });
});
