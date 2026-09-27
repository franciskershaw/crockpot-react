import { describe, expect, it } from "vitest";

import { buildUndoSlots, type Removal } from "./undoSlots";

const keyOf = (item: string) => item;

function removal(
  key: string,
  anchorKey: string | null,
  index = 0,
  overrides: Partial<Removal<string>> = {},
): Removal<string> {
  return {
    key,
    item: key,
    anchorKey,
    index,
    settled: true,
    undone: false,
    ...overrides,
  };
}

function layout(items: string[], removals: Removal<string>[]) {
  return buildUndoSlots(items, keyOf, removals).map((slot) =>
    slot.undo ? `(${slot.key})` : slot.key,
  );
}

describe("buildUndoSlots", () => {
  it("puts a tile where the removed item was", () => {
    expect(layout(["a", "c"], [removal("b", "a", 1)])).toEqual([
      "a",
      "(b)",
      "c",
    ]);
  });

  it("puts a tile first when the first item was removed", () => {
    expect(layout(["b", "c"], [removal("a", null, 0)])).toEqual([
      "(a)",
      "b",
      "c",
    ]);
  });

  it("keeps several tiles in their own places", () => {
    expect(
      layout(["a", "c", "e"], [removal("b", "a", 1), removal("d", "c", 2)]),
    ).toEqual(["a", "(b)", "c", "(d)", "e"]);
  });

  it("keeps an item removed right after a tile behind that tile", () => {
    expect(
      layout(["a", "d"], [removal("b", "a", 1), removal("c", "b", 1)]),
    ).toEqual(["a", "(b)", "(c)", "d"]);
  });

  it("drops the tile for an item that's back in the list, and tiles after it follow it", () => {
    expect(
      layout(["a", "b", "d"], [removal("b", "a", 1), removal("c", "b", 1)]),
    ).toEqual(["a", "b", "(c)", "d"]);
  });

  it("falls back to the removed position when its anchor has gone", () => {
    expect(layout(["a", "c", "d"], [removal("x", "gone", 2)])).toEqual([
      "a",
      "c",
      "(x)",
      "d",
    ]);
  });

  it("counts only live items before each slot, and names the slot before it", () => {
    const slots = buildUndoSlots(["a", "c", "e"], keyOf, [
      removal("b", "a", 1),
      removal("d", "c", 2),
    ]);

    expect(slots.map((slot) => slot.index)).toEqual([0, 1, 1, 2, 2]);
    expect(slots.map((slot) => slot.anchorKey)).toEqual([
      null,
      "a",
      "b",
      "c",
      "d",
    ]);
  });
});
