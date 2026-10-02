import type { Item, ItemCategory } from "../data/types";

// An item whose category isn't loaded is kept (the backend defaults to ingredient).
export function ingredientItems(
  items: Item[],
  categories: ItemCategory[],
): Item[] {
  const excluded = new Set(
    categories
      .filter((category) => !category.isIngredient)
      .map((category) => category.id),
  );
  return items.filter((item) => !excluded.has(item.categoryId));
}
