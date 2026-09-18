import { describe, expect, it } from "vitest";

import { recipeKeys } from "./queryKeys";

describe("recipeKeys.list", () => {
  it("produces the same key for params that resolve to the same request", () => {
    // categoryMode is meaningless without categoryIds — must not cause a refetch.
    expect(recipeKeys.list({})).toEqual(
      recipeKeys.list({ categoryMode: "exclude" }),
    );
  });

  it("produces a different key once categoryMode actually changes the request", () => {
    expect(recipeKeys.list({ categoryIds: ["c1"] })).not.toEqual(
      recipeKeys.list({ categoryIds: ["c1"], categoryMode: "exclude" }),
    );
  });

  it("still varies the key for filters that do change the request", () => {
    expect(recipeKeys.list({ q: "chicken" })).not.toEqual(recipeKeys.list({}));
    expect(recipeKeys.list({ categoryIds: ["c1"] })).not.toEqual(
      recipeKeys.list({ categoryIds: ["c2"] }),
    );
  });
});
