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

export interface Regular {
  id: string;
  itemId: string;
  itemName: string;
  categoryId: string;
  categoryName: string;
  unitId: string | null;
  unitAbbreviation: string | null;
  quantity: number;
}

export interface AddedRow {
  itemId: string;
  unitId: string | null;
}

export interface RecentlyAdded {
  rows: AddedRow[];
  key: number;
}
