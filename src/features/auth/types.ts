export type UserRole = "FREE" | "PREMIUM" | "PRO" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: UserRole;
}

export type AuthCallbackErrorCode =
  | "missing_code"
  | "missing_state"
  | "invalid_state"
  | "exchange_failed"
  | "verify_failed"
  | "email_not_verified"
  | "email_registered_with_password"
  | "server_error";

const MESSAGES: Partial<Record<AuthCallbackErrorCode, string>> = {};
const FALLBACK = "We couldn't sign you in. Please try again.";

export function getAuthErrorMessage(code: string): string {
  return MESSAGES[code as AuthCallbackErrorCode] ?? FALLBACK;
}
