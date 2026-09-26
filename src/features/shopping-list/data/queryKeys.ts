export const shoppingListKeys = {
  all: ["shopping-list"] as const,
  list: () => [...shoppingListKeys.all] as const,
};
