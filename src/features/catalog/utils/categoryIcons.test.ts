import {
  Apple,
  Archive,
  Beef,
  Carrot,
  Fish,
  Leaf,
  Package,
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

  it("falls back to Package for an unrecognized category name", () => {
    expect(getCategoryIcon("Some New Category")).toBe(Package);
  });
});
