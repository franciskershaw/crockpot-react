// `to` is where the tab links; `path` is the section it's current across.
export const YOUR_CROCKPOT_TABS = [
  { path: "/menu", to: "/menu", label: "Menu" },
  { path: "/library", to: "/library/favourites", label: "Library" },
] as const;

export const LIBRARY_TABS: { to: string; label: string; adminOnly?: true }[] = [
  { to: "/library/favourites", label: "Favourites" },
  { to: "/library/my-recipes", label: "My recipes" },
  { to: "/library/pending", label: "Pending", adminOnly: true },
];

function normalisePath(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

export function findYourCrockpotTab(pathname: string) {
  const path = normalisePath(pathname);
  return YOUR_CROCKPOT_TABS.find(
    (tab) => path === tab.path || path.startsWith(`${tab.path}/`),
  );
}

export function isYourCrockpotPath(pathname: string): boolean {
  return findYourCrockpotTab(pathname) !== undefined;
}
