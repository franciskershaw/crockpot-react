export const YOUR_CROCKPOT_TABS = [
  { to: "/menu", label: "Menu" },
  { to: "/favourites", label: "Favourites" },
  { to: "/my-recipes", label: "My recipes" },
] as const;

function normalisePath(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

export function findYourCrockpotTab(pathname: string) {
  const path = normalisePath(pathname);
  return YOUR_CROCKPOT_TABS.find((tab) => tab.to === path);
}

export function isYourCrockpotPath(pathname: string): boolean {
  return findYourCrockpotTab(pathname) !== undefined;
}
