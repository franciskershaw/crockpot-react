import { buildRecipeCard } from "@/test/recipeFixtures";
import { describe, expect, it } from "vitest";

import type { Menu, MenuEntry } from "../data/types";
import {
  addEntry,
  clearEntries,
  removeEntry,
  setServes,
} from "./menuTransforms";

function entry(id: string, serves = 4): MenuEntry {
  return { recipeId: id, serves, recipe: buildRecipeCard({ id }) };
}

function menu(...entries: MenuEntry[]): Menu {
  return { entries };
}

function ids(data: Menu | undefined) {
  return data?.entries.map((e) => `${e.recipeId}:${e.serves}`);
}

describe("addEntry", () => {
  const add = (id: string, serves: number, index?: number) => ({
    recipe: buildRecipeCard({ id }),
    serves,
    index,
  });

  it("puts a new recipe at the top, matching the server's newest-first order", () => {
    expect(ids(addEntry.apply(menu(entry("r_a")), add("r_new", 2)))).toEqual([
      "r_new:2",
      "r_a:4",
    ]);
  });

  it("honours an explicit index, e.g. undo restoring a slot", () => {
    const data = menu(entry("r_a"), entry("r_c"));
    expect(ids(addEntry.apply(data, add("r_b", 4, 1)))).toEqual([
      "r_a:4",
      "r_b:4",
      "r_c:4",
    ]);
  });

  it("updates a recipe already on the menu in place", () => {
    const data = menu(entry("r_a"), entry("r_b"));
    expect(ids(addEntry.apply(data, add("r_b", 8)))).toEqual([
      "r_a:4",
      "r_b:8",
    ]);
  });

  it("starts a menu when none is cached yet", () => {
    expect(ids(addEntry.apply(undefined, add("r_a", 2)))).toEqual(["r_a:2"]);
  });

  it("reverts a new recipe by removing it, leaving others' changes", () => {
    const variables = add("r_new", 2);
    const before = addEntry.capture(menu(entry("r_a")), variables);
    const now = menu(entry("r_other"), entry("r_new", 2), entry("r_a"));
    expect(ids(addEntry.revert(now, variables, before))).toEqual([
      "r_other:4",
      "r_a:4",
    ]);
  });

  it("reverts an update by restoring the previous serves in place", () => {
    const variables = add("r_b", 8);
    const before = addEntry.capture(
      menu(entry("r_a"), entry("r_b")),
      variables,
    );
    const now = menu(entry("r_a"), entry("r_b", 8));
    expect(ids(addEntry.revert(now, variables, before))).toEqual([
      "r_a:4",
      "r_b:4",
    ]);
  });

  it("leaves the menu alone on revert if the recipe has since gone", () => {
    const variables = add("r_new", 2);
    const before = addEntry.capture(menu(), variables);
    const now = menu(entry("r_a"));
    expect(addEntry.revert(now, variables, before)).toBe(now);
  });

  it("leaves the menu alone on revert if another change has since set its serves", () => {
    const variables = add("r_new", 2);
    const before = addEntry.capture(menu(), variables);
    const now = menu(entry("r_new", 5));
    expect(addEntry.revert(now, variables, before)).toBe(now);
  });
});

describe("removeEntry", () => {
  it("drops the recipe", () => {
    const data = menu(entry("r_a"), entry("r_b"));
    expect(ids(removeEntry.apply(data, { recipeId: "r_a" }))).toEqual([
      "r_b:4",
    ]);
  });

  it("reverts by putting the entry back at its old index", () => {
    const variables = { recipeId: "r_b" };
    const before = removeEntry.capture(
      menu(entry("r_a"), entry("r_b"), entry("r_c")),
      variables,
    );
    const now = menu(entry("r_a"), entry("r_c"));
    expect(ids(removeEntry.revert(now, variables, before))).toEqual([
      "r_a:4",
      "r_b:4",
      "r_c:4",
    ]);
  });

  it("clamps the restored index when the menu has since shrunk", () => {
    const variables = { recipeId: "r_c" };
    const before = removeEntry.capture(
      menu(entry("r_a"), entry("r_b"), entry("r_c")),
      variables,
    );
    const now = menu(entry("r_a"));
    expect(ids(removeEntry.revert(now, variables, before))).toEqual([
      "r_a:4",
      "r_c:4",
    ]);
  });

  it("leaves the menu alone on revert if the recipe is already back", () => {
    const variables = { recipeId: "r_a" };
    const before = removeEntry.capture(menu(entry("r_a")), variables);
    const now = menu(entry("r_a", 6));
    expect(removeEntry.revert(now, variables, before)).toBe(now);
  });

  it("leaves the menu alone on revert if the recipe was never on it", () => {
    const variables = { recipeId: "r_x" };
    const before = removeEntry.capture(menu(entry("r_a")), variables);
    const now = menu(entry("r_a"));
    expect(removeEntry.revert(now, variables, before)).toBe(now);
  });
});

describe("setServes", () => {
  it("sets the matching entry's serves and leaves others alone", () => {
    const data = menu(entry("r_a"), entry("r_b"));
    expect(ids(setServes.apply(data, { recipeId: "r_b", serves: 7 }))).toEqual([
      "r_a:4",
      "r_b:7",
    ]);
  });

  it("reverts to the previous serves", () => {
    const variables = { recipeId: "r_b", serves: 7 };
    const before = setServes.capture(menu(entry("r_b", 3)), variables);
    expect(
      ids(setServes.revert(menu(entry("r_b", 7)), variables, before)),
    ).toEqual(["r_b:3"]);
  });

  it("leaves the menu alone on revert if the recipe has since gone", () => {
    const variables = { recipeId: "r_b", serves: 7 };
    const before = setServes.capture(menu(entry("r_b", 3)), variables);
    const now = menu(entry("r_a"));
    expect(setServes.revert(now, variables, before)).toBe(now);
  });

  it("leaves the menu alone on revert if another change has since set its serves", () => {
    const variables = { recipeId: "r_b", serves: 7 };
    const before = setServes.capture(menu(entry("r_b", 3)), variables);
    const now = menu(entry("r_b", 9));
    expect(setServes.revert(now, variables, before)).toBe(now);
  });
});

describe("clearEntries", () => {
  it("empties the menu", () => {
    expect(ids(clearEntries.apply(menu(entry("r_a")), undefined))).toEqual([]);
  });

  it("reverts by restoring the cleared entries below anything added since", () => {
    const before = clearEntries.capture(
      menu(entry("r_a"), entry("r_b")),
      undefined,
    );
    const now = menu(entry("r_new", 2), entry("r_b", 6));
    expect(ids(clearEntries.revert(now, undefined, before))).toEqual([
      "r_new:2",
      "r_b:6",
      "r_a:4",
    ]);
  });
});

// e.g. the session ended mid-request and endSession removed every cache.
describe("reverting after the menu cache has been wiped", () => {
  it("addEntry leaves it wiped", () => {
    const recipe = buildRecipeCard({ id: "r_a" });
    expect(addEntry.revert(undefined, { recipe, serves: 4 }, undefined)).toBe(
      undefined,
    );
  });

  it("removeEntry leaves it wiped", () => {
    expect(
      removeEntry.revert(
        undefined,
        { recipeId: "r_a" },
        { entry: entry("r_a"), index: 0 },
      ),
    ).toBe(undefined);
  });

  it("setServes leaves it wiped", () => {
    expect(setServes.revert(undefined, { recipeId: "r_a", serves: 6 }, 4)).toBe(
      undefined,
    );
  });

  it("clearEntries leaves it wiped", () => {
    expect(clearEntries.revert(undefined, undefined, [entry("r_a")])).toBe(
      undefined,
    );
  });
});
