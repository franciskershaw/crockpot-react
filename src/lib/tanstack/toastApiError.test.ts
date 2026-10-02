import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, SessionExpiredError } from "../http/client";
import { toastApiError } from "./toastApiError";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

describe("toastApiError", () => {
  it("toasts an ApiError's message", () => {
    toastApiError(new ApiError(500, "boom"));

    expect(toast.error).toHaveBeenCalledWith("boom");
  });

  it("toasts a generic message for anything else", () => {
    toastApiError(new TypeError("Failed to fetch"));

    expect(toast.error).toHaveBeenCalledWith("request failed");
  });

  it("stays quiet for an expired session, which has its own toast", () => {
    toastApiError(new SessionExpiredError());

    expect(toast.error).not.toHaveBeenCalled();
  });

  it("still toasts a plain 401", () => {
    toastApiError(new ApiError(401, "unauthorized"));

    expect(toast.error).toHaveBeenCalledWith("unauthorized");
  });
});
