export interface Item {
  id: string;
  name: string;
  categoryId: string;
  allowedUnitIds: string[];
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
}

export interface ItemCategory {
  id: string;
  name: string;
}
