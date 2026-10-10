export type UserRole = "FREE" | "PREMIUM" | "PRO" | "ADMIN";

export type AuthProvider = "password" | "google";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  authProvider: AuthProvider;
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

const MESSAGES: Partial<Record<AuthCallbackErrorCode, string>> = {
  email_registered_with_password:
    "This email uses a password. Sign in with email instead.",
};
const FALLBACK = "We couldn't sign you in. Please try again.";

export function getAuthErrorMessage(code: string): string {
  return (
    (Object.hasOwn(MESSAGES, code) &&
      MESSAGES[code as AuthCallbackErrorCode]) ||
    FALLBACK
  );
}
