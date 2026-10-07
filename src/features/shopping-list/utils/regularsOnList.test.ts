import {
  buildRegular,
  buildShoppingListItem,
} from "@/test/shoppingListFixtures";
import { describe, expect, it } from "vitest";

import { regularsOnList } from "./regularsOnList";

const milk = buildRegular({ id: "reg_milk", itemId: "i_milk", unitId: "u_pt" });
const eggs = buildRegular({ id: "reg_eggs", itemId: "i_eggs", unitId: null });

describe("regularsOnList", () => {
  it("is empty when no list row shares a regular's item", () => {
    const items = [buildShoppingListItem({ itemId: "i_onions", unitId: null })];

    expect(regularsOnList([milk, eggs], items)).toEqual(new Set());
  });

  it("includes a regular whose item and unit are on the list unbought", () => {
    const items = [buildShoppingListItem({ itemId: "i_milk", unitId: "u_pt" })];

    expect(regularsOnList([milk, eggs], items)).toEqual(new Set(["reg_milk"]));
  });

  it("leaves out a regular whose matching row is bought", () => {
    const items = [
      buildShoppingListItem({
        itemId: "i_milk",
        unitId: "u_pt",
        obtained: true,
      }),
    ];

    expect(regularsOnList([milk, eggs], items)).toEqual(new Set());
  });

  it("matches a null unit to a null unit", () => {
    const items = [buildShoppingListItem({ itemId: "i_eggs", unitId: null })];

    expect(regularsOnList([milk, eggs], items)).toEqual(new Set(["reg_eggs"]));
  });

  it("doesn't match a null unit to a real one, either way round", () => {
    const items = [
      buildShoppingListItem({ id: "a", itemId: "i_milk", unitId: null }),
      buildShoppingListItem({ id: "b", itemId: "i_eggs", unitId: "u_box" }),
    ];

    expect(regularsOnList([milk, eggs], items)).toEqual(new Set());
  });

  it("doesn't match the same item in a different unit", () => {
    const items = [buildShoppingListItem({ itemId: "i_milk", unitId: "u_l" })];

    expect(regularsOnList([milk, eggs], items)).toEqual(new Set());
  });

  it("counts a regular as on the list when any one matching row is unbought", () => {
    const items = [
      buildShoppingListItem({
        id: "a",
        itemId: "i_milk",
        unitId: "u_pt",
        obtained: true,
      }),
      buildShoppingListItem({ id: "b", itemId: "i_milk", unitId: "u_pt" }),
    ];

    expect(regularsOnList([milk], items)).toEqual(new Set(["reg_milk"]));
  });
});
