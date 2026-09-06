import type { ApiError } from "@/lib/http/client";
import type { UseQueryResult } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Item, RecipeCategory, RecipeTimeRange } from "../types";
import { FilterPanel } from "./FilterPanel";

function query<T>(overrides: Partial<UseQueryResult<T, ApiError>> = {}) {
  return {
    data: undefined,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as UseQueryResult<T, ApiError>;
}

function baseProps() {
  return {
    categoryIds: [],
    categoryMode: "include" as const,
    ingredientIds: [],
    minTime: undefined,
    maxTime: undefined,
    onToggleCategory: vi.fn(),
    onCategoryModeChange: vi.fn(),
    onToggleIngredient: vi.fn(),
    onSetTimeRange: vi.fn(),
    categoriesQuery: query<RecipeCategory[]>({ data: [] }),
    itemsQuery: query<Item[]>({ data: [] }),
    timeRangeQuery: query<RecipeTimeRange>(),
  };
}

describe("FilterPanel", () => {
  it("shows an inline retry for categories when that query errors, without hiding the other sections", async () => {
    const categoriesQuery = query<RecipeCategory[]>({ isError: true });
    render(<FilterPanel {...baseProps()} categoriesQuery={categoriesQuery} />);

    expect(screen.getByText(/couldn't load categories/i)).toBeInTheDocument();

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /retry/i }));

    expect(categoriesQuery.refetch).toHaveBeenCalled();
  });

  it("shows an inline retry for ingredients when that query errors", () => {
    const itemsQuery = query<Item[]>({ isError: true });
    render(<FilterPanel {...baseProps()} itemsQuery={itemsQuery} />);

    expect(screen.getByText(/couldn't load ingredients/i)).toBeInTheDocument();
  });

  it("shows an inline retry for time range when that query errors", () => {
    const timeRangeQuery = query<RecipeTimeRange>({ isError: true });
    render(<FilterPanel {...baseProps()} timeRangeQuery={timeRangeQuery} />);

    expect(screen.getByText(/couldn't load time range/i)).toBeInTheDocument();
  });
});
