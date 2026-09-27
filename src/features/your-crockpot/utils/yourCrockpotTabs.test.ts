import { describe, expect, it } from "vitest";

import { isYourCrockpotPath } from "./yourCrockpotTabs";

describe("isYourCrockpotPath", () => {
  it.each(["/menu", "/favourites", "/my-recipes", "/menu/"])(
    "is true for %s",
    (path) => {
      expect(isYourCrockpotPath(path)).toBe(true);
    },
  );

  it.each(["/recipes", "/", "/menus", "/recipes/menu"])(
    "is false for %s",
    (path) => {
      expect(isYourCrockpotPath(path)).toBe(false);
    },
  );
});
