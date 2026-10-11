import {
  Apple,
  Archive,
  Beef,
  BottleWine,
  Carrot,
  Cookie,
  Croissant,
  Cupcake,
  Earth,
  Fish,
  House,
  Leaf,
  Microwave,
  Milk,
  Package,
  PillBottle,
  Salad,
  Snowflake,
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
  "Snacks and Sweets": Cookie,
  Bakery: Croissant,
  Meat: Beef,
  Dairy: Milk,
  Fruit: Apple,
  Fish: Fish,
  "Ready Meal": Microwave,
  Baking: Cupcake,
  "Chutneys and Spreads": PillBottle,
  Frozen: Snowflake,
  Sides: Salad,
  "World Foods": Earth,
};

export function getCategoryIcon(categoryName: string): LucideIcon {
  return CATEGORY_ICONS[categoryName] ?? Package;
}
