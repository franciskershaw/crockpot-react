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

// Keyed by item_categories.name. The API's own icon column holds different
// lucide names for some categories; this map is what the UI shows.
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
