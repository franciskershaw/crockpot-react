import type { User } from "@/features/auth/data/types";
import { apiFetch } from "@/lib/http/client";

export function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ accessToken: string }> {
  return apiFetch<{ accessToken: string }>("/me/password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deleteAccount(body: { password?: string }): Promise<void> {
  return apiFetch<void>("/me", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function updateName(name: string): Promise<User> {
  return apiFetch<User>("/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}
