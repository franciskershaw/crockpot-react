import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  confirmCodeSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./authSchemas";

function fieldErrors(schema: z.ZodType, values: unknown) {
  const result = schema.safeParse(values);
  if (result.success) return {};
  const { formErrors, fieldErrors } = z.flattenError(result.error);
  return formErrors.length > 0
    ? { ...fieldErrors, form: formErrors }
    : fieldErrors;
}

// 25 three-byte characters: 75 bytes, though only 25 characters long.
const seventyFiveBytes = "€".repeat(25);

describe("loginSchema", () => {
  it("accepts an email and any non-empty password", () => {
    expect(
      fieldErrors(loginSchema, { email: "jamie@example.com", password: "x" }),
    ).toEqual({});
  });

  it("asks for a valid email and a password", () => {
    expect(fieldErrors(loginSchema, { email: "jamie", password: "" })).toEqual({
      email: ["Enter a valid email address."],
      password: ["Enter your password."],
    });
  });
});

describe("registerSchema", () => {
  const valid = {
    name: "Jamie Alder",
    email: "jamie@example.com",
    password: "correcthorse",
    confirmPassword: "correcthorse",
  };

  it("accepts a complete form", () => {
    expect(fieldErrors(registerSchema, valid)).toEqual({});
  });

  it("asks for a name that isn't just spaces", () => {
    expect(fieldErrors(registerSchema, { ...valid, name: "   " })).toEqual({
      name: ["Enter your name."],
    });
  });

  it("caps the name at 50 characters", () => {
    expect(
      fieldErrors(registerSchema, { ...valid, name: "a".repeat(51) }),
    ).toEqual({
      name: ["Enter a name between 1 and 50 characters."],
    });
  });

  it("accepts a 72-byte password", () => {
    const password = "a".repeat(72);
    expect(
      fieldErrors(registerSchema, {
        ...valid,
        password,
        confirmPassword: password,
      }),
    ).toEqual({});
  });

  it("counts the password limit in bytes, not characters", () => {
    expect(
      fieldErrors(registerSchema, {
        ...valid,
        password: seventyFiveBytes,
        confirmPassword: seventyFiveBytes,
      }),
    ).toEqual({ password: ["Password must be 72 bytes or fewer."] });
  });

  it("reports a short password and a mismatch together", () => {
    expect(
      fieldErrors(registerSchema, {
        ...valid,
        password: "short",
        confirmPassword: "shorter",
      }),
    ).toEqual({
      password: ["Password must be at least 8 characters."],
      confirmPassword: ["Passwords don't match."],
    });
  });
});

describe("resetPasswordSchema", () => {
  it("accepts matching passwords", () => {
    expect(
      fieldErrors(resetPasswordSchema, {
        password: "newhorse1",
        confirmPassword: "newhorse1",
      }),
    ).toEqual({});
  });

  it("applies the same password rules and mismatch check", () => {
    expect(
      fieldErrors(resetPasswordSchema, {
        password: "short",
        confirmPassword: "different",
      }),
    ).toEqual({
      password: ["Password must be at least 8 characters."],
      confirmPassword: ["Passwords don't match."],
    });
  });
});

describe("forgotPasswordSchema", () => {
  it("asks for a valid email", () => {
    expect(fieldErrors(forgotPasswordSchema, { email: "nope" })).toEqual({
      email: ["Enter a valid email address."],
    });
    expect(
      fieldErrors(forgotPasswordSchema, { email: "jamie@example.com" }),
    ).toEqual({});
  });
});

describe("confirmCodeSchema", () => {
  it.each(["42910", "42910a", "4291070"])("rejects %s", (code) => {
    expect(fieldErrors(confirmCodeSchema, { code })).toEqual({
      code: ["Enter the 6-digit code."],
    });
  });

  it("accepts six digits", () => {
    expect(fieldErrors(confirmCodeSchema, { code: "429107" })).toEqual({});
  });
});
