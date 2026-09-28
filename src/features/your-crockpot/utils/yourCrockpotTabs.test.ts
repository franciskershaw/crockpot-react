import { describe, expect, it } from "vitest";

import { isYourCrockpotPath } from "./yourCrockpotTabs";

describe("isYourCrockpotPath", () => {
  it.each([
    "/menu",
    "/menu/",
    "/library",
    "/library/favourites",
    "/library/my-recipes",
    "/library/favourites/",
  ])("is true for %s", (path) => {
    expect(isYourCrockpotPath(path)).toBe(true);
  });

  it.each(["/recipes", "/", "/menus", "/recipes/menu", "/libraryx"])(
    "is false for %s",
    (path) => {
      expect(isYourCrockpotPath(path)).toBe(false);
    },
  );
});
