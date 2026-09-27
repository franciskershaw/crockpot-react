import { apiFetch } from "@/lib/http/client";

import type { Item, ItemCategory, Unit } from "./types";

export function listItems(): Promise<Item[]> {
  return apiFetch<Item[]>("/items");
}

export function listUnits(): Promise<Unit[]> {
  return apiFetch<Unit[]>("/units");
}

export function listItemCategories(): Promise<ItemCategory[]> {
  return apiFetch<ItemCategory[]>("/item-categories");
}
