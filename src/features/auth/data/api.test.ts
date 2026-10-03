import { fakeResponse } from "@/test/fakeResponse";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  confirmEmail,
  forgotPassword,
  login,
  register,
  resendConfirmation,
  resetPassword,
} from "./api";

const email = "jamie@example.com";

const calls: [string, () => Promise<unknown>, string, unknown][] = [
  [
    "register",
    () => register({ name: "Jamie", email, password: "correcthorse" }),
    "/auth/register",
    { name: "Jamie", email, password: "correcthorse" },
  ],
  [
    "confirmEmail",
    () => confirmEmail({ email, code: "429107" }),
    "/auth/confirm",
    { email, code: "429107" },
  ],
  [
    "resendConfirmation",
    () => resendConfirmation({ email }),
    "/auth/resend-confirmation",
    { email },
  ],
  [
    "login",
    () => login({ email, password: "correcthorse" }),
    "/auth/login",
    { email, password: "correcthorse" },
  ],
  [
    "forgotPassword",
    () => forgotPassword({ email }),
    "/auth/forgot-password",
    { email },
  ],
  [
    "resetPassword",
    () => resetPassword({ token: "reset-token", newPassword: "newhorse1" }),
    "/auth/reset-password",
    { token: "reset-token", newPassword: "newhorse1" },
  ],
];

describe("password auth requests", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(calls)("%s POSTs its JSON body", async (_, call, path, body) => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(fakeResponse(true, 200, { message: "ok" }));

    await call();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url).endsWith(path)).toBe(true);
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("Content-Type")).toBe(
      "application/json",
    );
    expect(JSON.parse(String(init?.body))).toEqual(body);
  });

  it.each(calls)(
    "%s surfaces a 401 without trying to refresh",
    async (_, call) => {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(
          fakeResponse(false, 401, { error: "invalid_credentials" }),
        );

      await expect(call()).rejects.toMatchObject({
        status: 401,
        message: "invalid_credentials",
      });
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    },
  );
});
