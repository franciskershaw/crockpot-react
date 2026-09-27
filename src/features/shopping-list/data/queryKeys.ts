export const shoppingListKeys = {
  all: ["shopping-list"] as const,
  list: () => [...shoppingListKeys.all] as const,
  change: () => [...shoppingListKeys.all, "change"] as const,
};
