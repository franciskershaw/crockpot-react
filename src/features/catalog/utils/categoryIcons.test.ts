import {
  Apple,
  Archive,
  Beef,
  Carrot,
  Cookie,
  Cupcake,
  Earth,
  Fish,
  Leaf,
  Package,
  PillBottle,
  Salad,
  Snowflake,
} from "lucide-react";
import { describe, expect, it } from "vitest";

import { getCategoryIcon } from "./categoryIcons";

describe("getCategoryIcon", () => {
  it("maps a known seeded category name to its icon", () => {
    expect(getCategoryIcon("Veg")).toBe(Carrot);
    expect(getCategoryIcon("Meat")).toBe(Beef);
    expect(getCategoryIcon("Fish")).toBe(Fish);
    expect(getCategoryIcon("Fruit")).toBe(Apple);
    expect(getCategoryIcon("Cupboard")).toBe(Archive);
    expect(getCategoryIcon("Herbs and Spices")).toBe(Leaf);
  });

  it("maps the categories added by the item audit", () => {
    expect(getCategoryIcon("Baking")).toBe(Cupcake);
    expect(getCategoryIcon("Chutneys and Spreads")).toBe(PillBottle);
    expect(getCategoryIcon("Frozen")).toBe(Snowflake);
    expect(getCategoryIcon("Sides")).toBe(Salad);
    expect(getCategoryIcon("World Foods")).toBe(Earth);
    expect(getCategoryIcon("Snacks and Sweets")).toBe(Cookie);
  });

  it("falls back to Package for an unrecognized category name", () => {
    expect(getCategoryIcon("Some New Category")).toBe(Package);
  });
});
