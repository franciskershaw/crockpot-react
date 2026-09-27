import type { Item } from "@/features/catalog/data/types";
import { describe, expect, it } from "vitest";

import { searchItems } from "./searchItems";

function item(name: string): Item {
  return { id: name, name, categoryId: "c_1", allowedUnitIds: [] };
}

const catalog = [
  "Red chillies",
  "Chives",
  "Chicken thighs",
  "Onions",
  "Chickpeas",
  "Chilli flakes",
  "Chicken stock",
].map(item);

describe("searchItems", () => {
  it.each(["", "   "])("returns nothing for a blank query (%j)", (query) => {
    expect(searchItems(catalog, query)).toEqual([]);
  });

  it("matches a case-insensitive substring anywhere in the name", () => {
    const names = searchItems(catalog, "CHI").map((m) => m.item.name);

    expect(names).toContain("Red chillies");
    expect(names).not.toContain("Onions");
  });

  it("ranks names starting with the query first, then alphabetically", () => {
    expect(searchItems(catalog, "chi").map((m) => m.item.name)).toEqual([
      "Chicken stock",
      "Chicken thighs",
      "Chickpeas",
      "Chilli flakes",
      "Chives",
      "Red chillies",
    ]);
  });

  it("reports where the match is, for highlighting", () => {
    const match = searchItems(catalog, " chi ").find(
      (m) => m.item.name === "Red chillies",
    );

    expect(match).toMatchObject({ matchStart: 4, matchEnd: 7 });
  });
});
