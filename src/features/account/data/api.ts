import type { User } from "@/features/auth/data/types";
import { apiFetch } from "@/lib/http/client";

export function updateName(name: string): Promise<User> {
  return apiFetch<User>("/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}
