import { ApiError } from "@/lib/http/client";
import { describe, expect, it } from "vitest";

import { footerError, isShownOnForm, photoFieldError } from "./saveErrors";

const rateLimited = (retryAfterSeconds?: number) =>
  new ApiError(429, "rate_limit_exceeded", retryAfterSeconds);

describe("photoFieldError", () => {
  it.each([
    ["invalid_image", "Couldn't read that photo — use a JPG, PNG or WebP"],
    ["image_too_large", "That photo is too large — try a smaller one"],
  ])("explains a 400 %s under the photo", (code, message) => {
    expect(photoFieldError(new ApiError(400, code))).toBe(message);
  });

  it("leaves other errors to the footer", () => {
    expect(photoFieldError(new ApiError(400, "invalid_item_id"))).toBeNull();
    expect(photoFieldError(null)).toBeNull();
  });
});

describe("footerError", () => {
  const withPhoto = { sentPhoto: true };
  const withoutPhoto = { sentPhoto: false };

  it("explains the recipe cap", () => {
    expect(
      footerError(new ApiError(409, "recipe_limit_reached"), withoutPhoto),
    ).toBe("You've hit your recipe limit, so this can't be published yet.");
  });

  it("asks to check over any other 400", () => {
    expect(footerError(new ApiError(400, "invalid_item_id"), withPhoto)).toBe(
      "The server couldn't accept this recipe — check it over and try again.",
    );
  });

  it("stays quiet about a 400 the photo field explains", () => {
    expect(
      footerError(new ApiError(400, "image_too_large"), withPhoto),
    ).toBeNull();
  });

  it("asks to retry a failed upload", () => {
    expect(
      footerError(new ApiError(502, "image_upload_failed"), withPhoto),
    ).toBe("Couldn't upload the photo — try again");
  });

  it("leaves a 502 from anything else to the toast", () => {
    expect(footerError(new ApiError(502, "request failed"), withPhoto)).toBe(
      null,
    );
  });

  it.each([
    [600, "Too many photo uploads — try again in 10 minutes"],
    [61, "Too many photo uploads — try again in 2 minutes"],
    [45, "Too many photo uploads — try again in 1 minute"],
    [undefined, "Too many photo uploads — try again later"],
  ])("rounds a photo 429's %s seconds up to minutes", (seconds, message) => {
    expect(footerError(rateLimited(seconds), withPhoto)).toBe(message);
  });

  it("doesn't blame photos for a 429 on a save without one", () => {
    expect(footerError(rateLimited(120), withoutPhoto)).toBe(
      "Too many requests — try again in 2 minutes",
    );
  });

  it("shows nothing without an error", () => {
    expect(footerError(null, withPhoto)).toBeNull();
  });
});

describe("isShownOnForm", () => {
  it.each([
    new ApiError(400, "invalid_item_id"),
    new ApiError(400, "invalid_image"),
    new ApiError(409, "recipe_limit_reached"),
    new ApiError(429, "rate_limit_exceeded"),
    new ApiError(502, "image_upload_failed"),
  ])("keeps $status $message off the toast", (error) => {
    expect(isShownOnForm(error)).toBe(true);
  });

  it.each([
    new ApiError(500, "server_error"),
    new ApiError(502, "request failed"),
    new ApiError(403, "forbidden"),
  ])("leaves $status $message to the toast", (error) => {
    expect(isShownOnForm(error)).toBe(false);
  });
});
