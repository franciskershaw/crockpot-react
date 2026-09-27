import { apiFetch } from "@/lib/http/client";

import type { CreateItemInput, Item, ItemCategory, Unit } from "./types";

export function listItems(): Promise<Item[]> {
  return apiFetch<Item[]>("/items");
}

export function listUnits(): Promise<Unit[]> {
  return apiFetch<Unit[]>("/units");
}

export function listItemCategories(): Promise<ItemCategory[]> {
  return apiFetch<ItemCategory[]>("/item-categories");
}

export function createItem(input: CreateItemInput): Promise<Item> {
  return apiFetch<Item>("/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
