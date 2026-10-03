import { describe, expect, it } from "vitest";

import { getAuthErrorMessage } from "./types";

describe("getAuthErrorMessage", () => {
  it("tells a password account to sign in with email", () => {
    expect(getAuthErrorMessage("email_registered_with_password")).toBe(
      "This email has a password — sign in with email instead.",
    );
  });

  it("falls back to a generic message for other codes", () => {
    expect(getAuthErrorMessage("server_error")).toBe(
      "We couldn't sign you in. Please try again.",
    );
  });
});
