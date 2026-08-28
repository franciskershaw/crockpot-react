import { apiFetch } from "@/lib/http/client";

import type { User } from "./types";

export function fetchMe(): Promise<User> {
  return apiFetch<User>("/me");
}

export function logout(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/logout", { method: "POST" });
}
