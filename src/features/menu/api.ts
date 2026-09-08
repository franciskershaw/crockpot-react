import { apiFetch } from "@/lib/http/client";

import type { Menu } from "./types";

export function getMenu(): Promise<Menu> {
  return apiFetch<Menu>("/menu");
}

export function addMenuEntry(
  recipeId: string,
  serves: number,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/menu/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipeId, serves }),
  });
}

export function updateMenuEntryServes(
  recipeId: string,
  serves: number,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/menu/entries/${recipeId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ serves }),
  });
}

export function removeMenuEntry(
  recipeId: string,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/menu/entries/${recipeId}`, {
    method: "DELETE",
  });
}
