export const menuKeys = {
  all: ["menu"] as const,
  menu: () => [...menuKeys.all] as const,
  change: () => [...menuKeys.all, "change"] as const,
};
