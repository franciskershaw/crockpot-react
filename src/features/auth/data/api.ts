import { apiFetch } from "@/lib/http/client";

import type { User } from "./types";

export function fetchMe(): Promise<User> {
  return apiFetch<User>("/me");
}

export function logout(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/logout", { method: "POST" });
}

interface Message {
  message: string;
}

interface Session {
  accessToken: string;
}

// None of these can have a session yet, so a 401 is the server's answer, not an expired token.
function postJson<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    { refreshOn401: false },
  );
}

export function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<Message> {
  return postJson("/auth/register", input);
}

export function confirmEmail(input: {
  email: string;
  code: string;
}): Promise<Message> {
  return postJson("/auth/confirm", input);
}

export function resendConfirmation(input: { email: string }): Promise<Message> {
  return postJson("/auth/resend-confirmation", input);
}

export function login(input: {
  email: string;
  password: string;
}): Promise<Session> {
  return postJson("/auth/login", input);
}

export function forgotPassword(input: { email: string }): Promise<Message> {
  return postJson("/auth/forgot-password", input);
}

export function resetPassword(input: {
  token: string;
  newPassword: string;
}): Promise<Session> {
  return postJson("/auth/reset-password", input);
}
