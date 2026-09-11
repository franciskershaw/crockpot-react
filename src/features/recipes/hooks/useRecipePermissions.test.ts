import type { User } from "@/features/auth/types";
import { describe, expect, it } from "vitest";

import type { RecipeDetail } from "../types";
import { canManageRecipe, isOwnPendingRecipe } from "./useRecipePermissions";

function user(overrides: Partial<User> = {}): User {
  return {
    id: "u_1",
    email: "jamie@example.com",
    name: "Jamie",
    image: null,
    role: "FREE",
    ...overrides,
  };
}

function recipe(
  overrides: Partial<Pick<RecipeDetail, "createdById" | "approved">> = {},
): Pick<RecipeDetail, "createdById" | "approved"> {
  return { createdById: "u_1", approved: true, ...overrides };
}

describe("canManageRecipe", () => {
  it("is false for an anonymous viewer", () => {
    expect(canManageRecipe(recipe(), null)).toBe(false);
  });

  it("is true for the recipe's own creator", () => {
    expect(canManageRecipe(recipe({ createdById: "u_1" }), user())).toBe(true);
  });

  it("is true for an admin who isn't the creator", () => {
    expect(
      canManageRecipe(
        recipe({ createdById: "someone_else" }),
        user({ id: "admin_1", role: "ADMIN" }),
      ),
    ).toBe(true);
  });

  it("is false for a signed-in viewer who is neither the creator nor an admin", () => {
    expect(
      canManageRecipe(
        recipe({ createdById: "someone_else" }),
        user({ id: "u_1", role: "FREE" }),
      ),
    ).toBe(false);
  });
});

describe("isOwnPendingRecipe", () => {
  it("is false for an anonymous viewer", () => {
    expect(isOwnPendingRecipe(recipe({ approved: false }), null)).toBe(false);
  });

  it("is true for the creator's own unapproved recipe", () => {
    expect(
      isOwnPendingRecipe(
        recipe({ createdById: "u_1", approved: false }),
        user({ id: "u_1" }),
      ),
    ).toBe(true);
  });

  it("is false once the recipe is approved, even for its creator", () => {
    expect(
      isOwnPendingRecipe(
        recipe({ createdById: "u_1", approved: true }),
        user({ id: "u_1" }),
      ),
    ).toBe(false);
  });

  it("is false for an admin viewing someone else's unapproved recipe", () => {
    expect(
      isOwnPendingRecipe(
        recipe({ createdById: "someone_else", approved: false }),
        user({ id: "admin_1", role: "ADMIN" }),
      ),
    ).toBe(false);
  });
});
