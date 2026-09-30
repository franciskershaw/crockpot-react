import type { Item } from "@/features/catalog/data/types";

export interface ItemMatch {
  item: Item;
  matchStart: number;
  matchEnd: number;
}

export function searchItems(items: Item[], query: string): ItemMatch[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const matches: ItemMatch[] = [];
  for (const item of items) {
    const matchStart = item.name.toLowerCase().indexOf(needle);
    if (matchStart !== -1) {
      matches.push({ item, matchStart, matchEnd: matchStart + needle.length });
    }
  }

  return matches.sort((a, b) => {
    const aStarts = a.matchStart === 0;
    const bStarts = b.matchStart === 0;
    if (aStarts !== bStarts) return aStarts ? -1 : 1;
    return a.item.name.localeCompare(b.item.name);
  });
}
