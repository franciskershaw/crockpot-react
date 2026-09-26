export interface ShoppingListItem {
  id: string;
  itemId: string;
  itemName: string;
  itemCategoryId: string;
  itemCategoryName: string;
  unitId: string | null;
  unitAbbreviation: string | null;
  quantity: number;
  obtained: boolean;
  isManual: boolean;
}

export interface ShoppingList {
  items: ShoppingListItem[];
}
