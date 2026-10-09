import { buildUser } from "@/test/authFixtures";
import { describe, expect, it } from "vitest";

import type { RecipeDetail } from "../data/types";
import { canManageRecipe, isOwnPendingRecipe } from "./useRecipePermissions";

function recipe(
  overrides: Partial<Pick<RecipeDetail, "createdById" | "approved">> = {},
): Pick<RecipeDetail, "createdById" | "approved"> {
  return { createdById: "u_1", approved: true, ...overrides };
}

describe("canManageRecipe", () => {
  const owner = buildUser({ id: "u_1", role: "FREE" });
  const admin = buildUser({ id: "admin_1", role: "ADMIN" });
  const other = buildUser({ id: "u_2", role: "FREE" });

  it.each([
    { who: "an admin", user: admin, approved: false, expected: true },
    { who: "an admin", user: admin, approved: true, expected: true },
    { who: "the owner", user: owner, approved: false, expected: true },
    { who: "the owner", user: owner, approved: true, expected: false },
    { who: "another user", user: other, approved: false, expected: false },
    { who: "another user", user: other, approved: true, expected: false },
    {
      who: "a signed-out viewer",
      user: null,
      approved: false,
      expected: false,
    },
    { who: "a signed-out viewer", user: null, approved: true, expected: false },
  ])(
    "for $who on a recipe with approved=$approved, is $expected",
    ({ user, approved, expected }) => {
      expect(
        canManageRecipe(recipe({ createdById: "u_1", approved }), user),
      ).toBe(expected);
    },
  );
});

describe("isOwnPendingRecipe", () => {
  it("is false for an anonymous viewer", () => {
    expect(isOwnPendingRecipe(recipe({ approved: false }), null)).toBe(false);
  });

  it("is true for the creator's own unapproved recipe", () => {
    expect(
      isOwnPendingRecipe(
        recipe({ createdById: "u_1", approved: false }),
        buildUser({ id: "u_1" }),
      ),
    ).toBe(true);
  });

  it("is false once the recipe is approved, even for its creator", () => {
    expect(
      isOwnPendingRecipe(
        recipe({ createdById: "u_1", approved: true }),
        buildUser({ id: "u_1" }),
      ),
    ).toBe(false);
  });

  it("is false for an admin viewing someone else's unapproved recipe", () => {
    expect(
      isOwnPendingRecipe(
        recipe({ createdById: "someone_else", approved: false }),
        buildUser({ id: "admin_1", role: "ADMIN" }),
      ),
    ).toBe(false);
  });
});
