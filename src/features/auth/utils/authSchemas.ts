import { byteLength } from "@/lib/byteLength";
import { z } from "zod";

const email = z.string().trim().pipe(z.email("Enter a valid email address."));

export const NAME_RULE = "Enter a name between 1 and 50 characters.";

// Counts code points to match the API's rune count.
export function nameField(emptyMessage: string) {
  return z
    .string()
    .trim()
    .min(1, emptyMessage)
    .refine((value) => [...value].length <= 50, NAME_RULE);
}

export const newPassword = z
  .string()
  .refine(
    (value) => byteLength(value) >= 8,
    "Password must be at least 8 characters.",
  )
  .refine(
    (value) => byteLength(value) <= 72,
    "Password must be 72 bytes or fewer.",
  );

const passwordPair = z.object({
  password: z.string(),
  confirmPassword: z.string(),
});

// `when` keeps the mismatch check running even if the password itself failed its own rules.
function withMatchingPasswords<
  S extends z.ZodType<{ password: string; confirmPassword: string }>,
>(schema: S) {
  return schema.refine((v) => v.password === v.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
    when: (payload) => passwordPair.safeParse(payload.value).success,
  });
}

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export const registerSchema = withMatchingPasswords(
  z.object({
    name: nameField("Enter your name."),
    email,
    password: newPassword,
    confirmPassword: z.string(),
  }),
);

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = withMatchingPasswords(
  z.object({ password: newPassword, confirmPassword: z.string() }),
);

export const confirmCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});
