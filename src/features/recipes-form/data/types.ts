export interface IngredientRow {
  itemId: string;
  itemName: string;
  itemCategoryName: string;
  unitId: string | null;
  quantity: string;
}

export interface RecipeFormValues {
  name: string;
  image: { url: string; filename: string } | null;
  description: string | null;
  timeInMinutes: number;
  serves: number;
  categoryIds: string[];
  ingredients: IngredientRow[];
  instructions: string;
  notes: string;
}
