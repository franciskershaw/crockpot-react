import { buildUser } from "@/test/authFixtures";
import { describe, expect, it } from "vitest";

import type { RecipeDetail } from "../data/types";
import { canManageRecipe, pendingApprovalViewer } from "./useRecipePermissions";

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

describe("pendingApprovalViewer", () => {
  const owner = buildUser({ id: "u_1", role: "FREE" });
  const admin = buildUser({ id: "admin_1", role: "ADMIN" });
  const adminOwner = buildUser({ id: "u_1", role: "ADMIN" });
  const other = buildUser({ id: "u_2", role: "FREE" });

  it.each([
    { who: "the owner", user: owner, expected: "owner" },
    { who: "an admin", user: admin, expected: "admin" },
    { who: "an admin who owns it", user: adminOwner, expected: "admin" },
    { who: "another user", user: other, expected: null },
    { who: "a signed-out viewer", user: null, expected: null },
  ])("on a pending recipe, is $expected for $who", ({ user, expected }) => {
    expect(
      pendingApprovalViewer(
        recipe({ createdById: "u_1", approved: false }),
        user,
      ),
    ).toBe(expected);
  });

  it.each([
    { who: "the owner", user: owner },
    { who: "an admin", user: admin },
  ])("on an approved recipe, is null for $who", ({ user }) => {
    expect(
      pendingApprovalViewer(
        recipe({ createdById: "u_1", approved: true }),
        user,
      ),
    ).toBeNull();
  });
});
