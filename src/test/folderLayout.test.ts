import { describe, expect, it } from "vitest";

// Single-segment globs match files only, so any hit is a loose file outside a bucket folder.
const looseComponents = Object.keys(import.meta.glob("../components/*"));
const looseFeatureFiles = Object.keys(import.meta.glob("../features/*/*"));

describe("folder layout", () => {
  it("keeps every shared component in a folder under src/components", () => {
    expect(looseComponents).toEqual([]);
  });

  it("keeps every feature file in one of its bucket folders", () => {
    expect(looseFeatureFiles).toEqual([]);
  });
});
