export const shoppingListKeys = {
  all: ["shopping-list"] as const,
  list: () => [...shoppingListKeys.all] as const,
  change: () => [...shoppingListKeys.all, "change"] as const,
};

// Its own root so shopping-list invalidations (prefix ["shopping-list"]) don't refetch regulars.
export const regularsKeys = {
  all: ["regulars"] as const,
  list: () => [...regularsKeys.all] as const,
};
