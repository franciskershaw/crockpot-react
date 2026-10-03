import { ApiError } from "@/lib/http/client";
import { describe, expect, it } from "vitest";

import { authErrorDisplay, isShownOnAuthForm } from "./authErrors";

describe("authErrorDisplay", () => {
  it.each([
    [
      400,
      "password_too_short",
      "password",
      "Password must be at least 8 characters.",
    ],
    [
      400,
      "password_too_long",
      "password",
      "Password must be 72 bytes or fewer.",
    ],
    [400, "code_invalid", "code", "That code isn't right."],
    [
      400,
      "code_expired",
      "code",
      "This code has expired. Resend to get a new one.",
    ],
    [
      400,
      "too_many_attempts",
      "code",
      "Too many attempts. Resend to get a new code.",
    ],
  ])("puts %i %s on the %s field", (status, code, target, message) => {
    expect(authErrorDisplay(new ApiError(status, code))).toEqual({
      target,
      message,
    });
  });

  it.each([
    [401, "invalid_credentials", "Incorrect email or password."],
    [400, "email_not_found", "We couldn't find an account with that email."],
  ])("shows %i %s in the banner", (status, code, message) => {
    expect(authErrorDisplay(new ApiError(status, code))).toEqual({
      target: "banner",
      message,
    });
  });

  it.each([
    [
      409,
      "email_already_registered",
      "This email's already registered.",
      "Sign in instead",
    ],
    [400, "already_confirmed", "This email's already confirmed.", "Sign in"],
  ])("points %i %s at sign-in", (status, code, message, label) => {
    expect(authErrorDisplay(new ApiError(status, code))).toEqual({
      target: "banner",
      message,
      action: { to: "signIn", label },
    });
  });

  it.each([
    [409, "email_registered_with_google"],
    [401, "google_account_no_password"],
  ])("points %i %s at Google sign-in", (status, code) => {
    expect(authErrorDisplay(new ApiError(status, code))).toEqual({
      target: "banner",
      message: "This email signs in with Google.",
      action: { to: "google", label: "Continue with Google" },
    });
  });

  it.each([
    ["rate_limit_exceeded", 120, "Try again in 2 minutes."],
    ["resend_too_soon", 45, "Try again in 1 minute."],
    ["rate_limit_exceeded", undefined, "Try again later."],
  ])("tells a 429 %s (%s s) when to retry", (code, seconds, message) => {
    expect(authErrorDisplay(new ApiError(429, code, seconds))).toEqual({
      target: "banner",
      message,
    });
  });

  it.each(["token_invalid", "token_expired"])(
    "sends a 400 %s to the invalid-link state",
    (code) => {
      expect(authErrorDisplay(new ApiError(400, code))).toEqual({
        target: "invalidLink",
      });
    },
  );

  it.each([
    [500, "server_error"],
    [400, "invalid_request"],
  ])("leaves %i %s to the toast", (status, code) => {
    expect(authErrorDisplay(new ApiError(status, code))).toBeNull();
  });
});

describe("isShownOnAuthForm", () => {
  it("is true only for errors the form displays itself", () => {
    expect(isShownOnAuthForm(new ApiError(401, "invalid_credentials"))).toBe(
      true,
    );
    expect(isShownOnAuthForm(new ApiError(500, "server_error"))).toBe(false);
  });
});
