export interface IngredientRow {
  itemId: string;
  itemName: string;
  itemCategoryName: string;
  unitId: string | null;
  quantity: string;
}

export type RecipeFormImage =
  | { kind: "existing"; url: string }
  | { kind: "new"; file: File; previewUrl: string };

export interface RecipeFormValues {
  name: string;
  image: RecipeFormImage | null;
  description: string;
  timeInMinutes: number;
  serves: number;
  categoryIds: string[];
  ingredients: IngredientRow[];
  instructions: string;
  notes: string;
}
