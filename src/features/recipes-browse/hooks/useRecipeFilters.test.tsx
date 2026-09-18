import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { useRecipeFilters } from "./useRecipeFilters";

function wrapper(initialEntry = "/recipes") {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  );
}

describe("useRecipeFilters", () => {
  it("parses an empty URL into empty params with zero active filters", () => {
    const { result } = renderHook(() => useRecipeFilters(), {
      wrapper: wrapper(),
    });

    expect(result.current.params).toEqual({});
    expect(result.current.activeFilterCount).toBe(0);
  });

  it("parses q, categoryId(s)/categoryMode, ingredientId(s), and time bounds from the URL", () => {
    const { result } = renderHook(() => useRecipeFilters(), {
      wrapper: wrapper(
        "/recipes?q=chicken&categoryId=c1&categoryId=c2&categoryMode=exclude&ingredientId=i1&minTime=20&maxTime=75",
      ),
    });

    expect(result.current.params).toEqual({
      q: "chicken",
      categoryIds: ["c1", "c2"],
      categoryMode: "exclude",
      ingredientIds: ["i1"],
      minTime: 20,
      maxTime: 75,
    });
    // time range (1) + 2 categories + 1 ingredient — q doesn't count.
    expect(result.current.activeFilterCount).toBe(4);
  });

  it("setQuery writes and clears the q param", () => {
    const { result } = renderHook(() => useRecipeFilters(), {
      wrapper: wrapper(),
    });

    act(() => result.current.setQuery("pork"));
    expect(result.current.params.q).toBe("pork");

    act(() => result.current.setQuery(""));
    expect(result.current.params.q).toBeUndefined();
  });

  it("toggleCategory adds then removes an id, keeping categoryMode once empty", () => {
    const { result } = renderHook(() => useRecipeFilters(), {
      wrapper: wrapper(),
    });

    act(() => result.current.toggleCategory("c1"));
    expect(result.current.params.categoryIds).toEqual(["c1"]);

    act(() => result.current.setCategoryMode("exclude"));
    expect(result.current.params.categoryMode).toBe("exclude");

    act(() => result.current.toggleCategory("c1"));
    expect(result.current.params.categoryIds).toBeUndefined();
    // Preserved: an explicitly-chosen mode shouldn't silently reset.
    expect(result.current.params.categoryMode).toBe("exclude");
  });

  it("setCategoryMode persists even before any category is selected", () => {
    const { result } = renderHook(() => useRecipeFilters(), {
      wrapper: wrapper(),
    });

    act(() => result.current.setCategoryMode("exclude"));
    expect(result.current.params.categoryMode).toBe("exclude");

    act(() => result.current.toggleCategory("c1"));
    expect(result.current.params.categoryIds).toEqual(["c1"]);
    expect(result.current.params.categoryMode).toBe("exclude");
  });

  it("setCategoryMode('include') omits the param since it's the default", () => {
    const { result } = renderHook(() => useRecipeFilters(), {
      wrapper: wrapper("/recipes?categoryId=c1&categoryMode=exclude"),
    });

    act(() => result.current.setCategoryMode("include"));
    expect(result.current.params.categoryMode).toBeUndefined();
  });

  it("toggleIngredient adds then removes an id", () => {
    const { result } = renderHook(() => useRecipeFilters(), {
      wrapper: wrapper(),
    });

    act(() => result.current.toggleIngredient("i1"));
    expect(result.current.params.ingredientIds).toEqual(["i1"]);

    act(() => result.current.toggleIngredient("i1"));
    expect(result.current.params.ingredientIds).toBeUndefined();
  });

  it("clearAll removes every filter param", () => {
    const { result } = renderHook(() => useRecipeFilters(), {
      wrapper: wrapper(
        "/recipes?q=chicken&categoryId=c1&ingredientId=i1&minTime=20&maxTime=75",
      ),
    });

    act(() => result.current.clearAll());

    expect(result.current.params).toEqual({});
    expect(result.current.activeFilterCount).toBe(0);
  });
});
