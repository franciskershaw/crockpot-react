import type { Item, ItemCategory } from "@/features/catalog/data/types";
import type {
  RecipeCategory,
  RecipeTimeRange,
} from "@/features/recipes/data/types";
import type { ApiError } from "@/lib/http/client";
import type { UseQueryResult } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FilterPanel } from "./FilterPanel";

function query<T>(overrides: Partial<UseQueryResult<T, ApiError>> = {}) {
  return {
    data: undefined,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as UseQueryResult<T, ApiError>;
}

function item(id: string, name: string, categoryId: string): Item {
  return { id, name, categoryId, allowedUnitIds: [] };
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
    itemCategoriesQuery: query<ItemCategory[]>({ data: [] }),
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

  it("lists only items whose category is an ingredient", async () => {
    const itemsQuery = query<Item[]>({
      data: [
        item("i_onion", "Onion", "c_veg"),
        item("i_bin_bags", "Bin bags", "c_house"),
        item("i_garlic", "Garlic", "c_veg"),
      ],
    });
    const itemCategoriesQuery = query<ItemCategory[]>({
      data: [
        { id: "c_veg", name: "Veg", isIngredient: true },
        { id: "c_house", name: "House", isIngredient: false },
      ],
    });
    render(
      <FilterPanel
        {...baseProps()}
        itemsQuery={itemsQuery}
        itemCategoriesQuery={itemCategoriesQuery}
      />,
    );

    expect(screen.getByRole("checkbox", { name: "Onion" })).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Garlic" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "Bin bags" }),
    ).not.toBeInTheDocument();
  });

  it("shows a loading state for categories while they're pending, not 0 results", () => {
    render(
      <FilterPanel
        {...baseProps()}
        categoriesQuery={query<RecipeCategory[]>({ isPending: true })}
        itemsQuery={query<Item[]>({
          data: [item("i_onion", "Onion", "c_veg")],
        })}
      />,
    );

    expect(screen.getByText("Loading categories…")).toBeInTheDocument();
    expect(screen.queryByText("0 results")).not.toBeInTheDocument();
  });

  it("shows a loading state for ingredients while items are pending, not 0 results", () => {
    render(
      <FilterPanel
        {...baseProps()}
        categoriesQuery={query<RecipeCategory[]>({
          data: [{ id: "c1", name: "Veggie" }],
        })}
        itemsQuery={query<Item[]>({ isPending: true })}
      />,
    );

    expect(screen.getByText("Loading ingredients…")).toBeInTheDocument();
    expect(screen.queryByText("0 results")).not.toBeInTheDocument();
  });

  it("keeps ingredients loading until item categories arrive, so household items never flash", () => {
    render(
      <FilterPanel
        {...baseProps()}
        itemsQuery={query<Item[]>({
          data: [
            item("i_onion", "Onion", "c_veg"),
            item("i_bin_bags", "Bin bags", "c_house"),
          ],
        })}
        itemCategoriesQuery={query<ItemCategory[]>({ isPending: true })}
      />,
    );

    expect(screen.getByText("Loading ingredients…")).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "Bin bags" }),
    ).not.toBeInTheDocument();
  });

  it("shows a loading state for time range while it's pending", () => {
    render(
      <FilterPanel
        {...baseProps()}
        timeRangeQuery={query<RecipeTimeRange>({ isPending: true })}
      />,
    );

    expect(screen.getByText("Loading time range…")).toBeInTheDocument();
  });
});
