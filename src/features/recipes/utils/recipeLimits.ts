// Mirrors crockpot-go's recipe validation; change both together.
export const RECIPE_LIMITS = {
  time: { min: 1, max: 1440 },
  serves: { min: 1, max: 50 },
  categories: { min: 1, max: 3 },
  ingredients: { min: 1, max: 50 },
  steps: { max: 50 },
  notes: { max: 10 },
} as const;
