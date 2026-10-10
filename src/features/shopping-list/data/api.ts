import { apiFetch } from "@/lib/http/client";

import type { Regular, RegularInput, ShoppingList } from "./types";

type MessageResponse = { message: string };

export function getShoppingList(): Promise<ShoppingList> {
  return apiFetch<ShoppingList>("/shopping-list");
}

export function addShoppingListItem(
  itemId: string,
  quantity: number,
  unitId: string | null,
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>("/shopping-list/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId, quantity, unitId }),
  });
}

export function updateShoppingListItem(
  id: string,
  changes: { obtained?: boolean; quantity?: number },
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(
    `/shopping-list/items/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    },
  );
}

export function deleteShoppingListItem(id: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(
    `/shopping-list/items/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}

export function clearShoppingList(): Promise<MessageResponse> {
  return apiFetch<MessageResponse>("/shopping-list", { method: "DELETE" });
}

export function regenerateShoppingList(): Promise<MessageResponse> {
  return apiFetch<MessageResponse>("/shopping-list/regenerate", {
    method: "POST",
  });
}

export function getRegulars(): Promise<Regular[]> {
  return apiFetch<Regular[]>("/regulars");
}

export function restockRegulars(
  regularIds: string[],
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>("/shopping-list/restock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ regularIds }),
  });
}

export function createRegular(input: RegularInput): Promise<Regular> {
  return apiFetch<Regular>("/regulars", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateRegular(
  id: string,
  changes: { quantity: number; unitId: string | null },
): Promise<Regular> {
  return apiFetch<Regular>(`/regulars/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });
}

export function deleteRegular(id: string): Promise<void> {
  return apiFetch<void>(`/regulars/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
