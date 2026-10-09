import { ApiError } from "@/lib/http/client";
import { describe, expect, it } from "vitest";

import { menuErrorCopy } from "./menuErrorCopy";

describe("menuErrorCopy", () => {
  it("explains the menu cap", () => {
    expect(menuErrorCopy(new ApiError(409, "menu_limit_reached"))).toBe(
      "You've reached the 30-recipe menu limit. Remove one to add another.",
    );
  });

  it("explains an oversized shopping-list quantity", () => {
    expect(
      menuErrorCopy(new ApiError(400, "shopping_list_quantity_too_large")),
    ).toBe(
      "That would push a shopping-list quantity past the largest amount we can store.",
    );
  });

  it("ignores a known code on the wrong status", () => {
    expect(menuErrorCopy(new ApiError(400, "menu_limit_reached"))).toBeNull();
  });

  it("ignores codes it doesn't know", () => {
    expect(menuErrorCopy(new ApiError(409, "something_else"))).toBeNull();
    expect(menuErrorCopy(new ApiError(409, "constructor"))).toBeNull();
    expect(menuErrorCopy(null)).toBeNull();
  });
});
