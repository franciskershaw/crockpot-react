import { authErrorDisplay } from "@/features/auth/utils/authErrors";
import type { ApiError } from "@/lib/http/client";

export const isInvalidName = (error: ApiError) =>
  error.status === 400 && error.message === "invalid_name";

export const isInvalidPassword = (error: ApiError) =>
  error.status === 403 && error.message === "invalid_password";

export function changePasswordFieldError(
  error: ApiError,
): { field: "currentPassword" | "newPassword"; message: string } | null {
  if (isInvalidPassword(error)) {
    return { field: "currentPassword", message: "That password isn't right." };
  }
  const display = authErrorDisplay(error);
  return display?.target === "password"
    ? { field: "newPassword", message: display.message }
    : null;
}
