import {
  Apple,
  Archive,
  Beef,
  BottleWine,
  Carrot,
  Cookie,
  Croissant,
  Fish,
  House,
  Leaf,
  Microwave,
  Milk,
  Package,
  Wine,
  type LucideIcon,
} from "lucide-react";

import type { HydratedIngredient } from "./types";

// Keyed by item_categories.name — the API doesn't expose that row's own
// icon column, so this duplicates it here; falls back to Package.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Cupboard: Archive,
  "Herbs and Spices": Leaf,
  Drinks: Wine,
  Veg: Carrot,
  Condiments: BottleWine,
  House: House,
  Sweets: Cookie,
  Bakery: Croissant,
  Meat: Beef,
  Dairy: Milk,
  Fruit: Apple,
  Fish: Fish,
  "Ready Meal": Microwave,
};

export function getCategoryIcon(categoryName: string): LucideIcon {
  return CATEGORY_ICONS[categoryName] ?? Package;
}

export function groupIngredientsByCategory(
  ingredients: HydratedIngredient[],
): Record<string, HydratedIngredient[]> {
  return ingredients.reduce<Record<string, HydratedIngredient[]>>(
    (acc, ingredient) => {
      (acc[ingredient.itemCategoryName] ??= []).push(ingredient);
      return acc;
    },
    {},
  );
}
