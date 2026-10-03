import type { ApiError } from "@/lib/http/client";
import { retryWait } from "@/lib/http/retryWait";

export type AuthErrorDisplay =
  | { target: "password" | "code"; message: string }
  | {
      target: "banner";
      message: string;
      action?: { to: "signIn" | "google"; label: string };
    }
  | { target: "invalidLink" };

const SIGNS_IN_WITH_GOOGLE: AuthErrorDisplay = {
  target: "banner",
  message: "This email signs in with Google.",
  action: { to: "google", label: "Continue with Google" },
};

const INVALID_LINK: AuthErrorDisplay = { target: "invalidLink" };

const DISPLAYS = new Map<string, AuthErrorDisplay>([
  [
    "password_too_short",
    { target: "password", message: "Password must be at least 8 characters." },
  ],
  [
    "password_too_long",
    { target: "password", message: "Password must be 72 bytes or fewer." },
  ],
  ["code_invalid", { target: "code", message: "That code isn't right." }],
  [
    "code_expired",
    {
      target: "code",
      message: "This code has expired. Resend to get a new one.",
    },
  ],
  [
    "too_many_attempts",
    { target: "code", message: "Too many attempts. Resend to get a new code." },
  ],
  [
    "invalid_credentials",
    { target: "banner", message: "Incorrect email or password." },
  ],
  [
    "email_not_found",
    {
      target: "banner",
      message: "We couldn't find an account with that email.",
    },
  ],
  [
    "email_already_registered",
    {
      target: "banner",
      message: "This email's already registered.",
      action: { to: "signIn", label: "Sign in instead" },
    },
  ],
  [
    "already_confirmed",
    {
      target: "banner",
      message: "This email's already confirmed.",
      action: { to: "signIn", label: "Sign in" },
    },
  ],
  ["email_registered_with_google", SIGNS_IN_WITH_GOOGLE],
  ["google_account_no_password", SIGNS_IN_WITH_GOOGLE],
  ["token_invalid", INVALID_LINK],
  ["token_expired", INVALID_LINK],
]);

// Null means the form doesn't show it, so useApiMutation's toast does.
export function authErrorDisplay(error: ApiError): AuthErrorDisplay | null {
  if (error.status === 429) {
    return {
      target: "banner",
      message: `Try again ${retryWait(error.retryAfterSeconds)}.`,
    };
  }
  return DISPLAYS.get(error.message) ?? null;
}

export function isShownOnAuthForm(error: ApiError): boolean {
  return authErrorDisplay(error) !== null;
}
