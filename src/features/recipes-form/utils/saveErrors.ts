import type { ApiError } from "@/lib/http/client";
import { retryWait } from "@/lib/http/retryWait";
import { PHOTO_DECODE_MESSAGE } from "@/lib/shrinkPhoto";

const PHOTO_FIELD_MESSAGES: Record<string, string> = {
  invalid_image: PHOTO_DECODE_MESSAGE,
  image_too_large: "That photo is too large — try a smaller one",
};

export function photoFieldError(error: ApiError | null): string | null {
  if (error?.status !== 400) return null;
  return PHOTO_FIELD_MESSAGES[error.message] ?? null;
}

// Errors this returns null for (bar the photo field's) are toasted by useApiMutation.
export function footerError(
  error: ApiError | null,
  { sentPhoto }: { sentPhoto: boolean },
): string | null {
  if (!error) return null;
  if (error.status === 409) {
    return "You've hit your recipe limit, so this can't be published yet.";
  }
  if (error.status === 429) {
    const what = sentPhoto ? "Too many photo uploads" : "Too many requests";
    return `${what} — try again ${retryWait(error.retryAfterSeconds)}`;
  }
  if (error.status === 502 && error.message === "image_upload_failed") {
    return "Couldn't upload the photo — try again";
  }
  if (error.status === 400 && !photoFieldError(error)) {
    return "The server couldn't accept this recipe — check it over and try again.";
  }
  return null;
}

export function isShownOnForm(error: ApiError): boolean {
  return (
    photoFieldError(error) !== null ||
    footerError(error, { sentPhoto: false }) !== null
  );
}
