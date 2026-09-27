import { setupQueryClient } from "@/test/queryClientTestUtils";
import { renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../http/client";
import { useApiMutation } from "./useApiMutation";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function run(options: Parameters<typeof useApiMutation<void, void>>[0]) {
  const { wrapper } = setupQueryClient();
  const { result } = renderHook(() => useApiMutation<void, void>(options), {
    wrapper,
  });
  result.current.mutate();
  return result;
}

describe("useApiMutation", () => {
  it("toasts the error message by default", async () => {
    const result = run({
      mutationFn: () => Promise.reject(new ApiError(500, "boom")),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith("boom");
  });

  it("skips the toast for errors the caller handles, but still calls onError", async () => {
    const onError = vi.fn();
    const result = run({
      mutationFn: () => Promise.reject(new ApiError(409, "name_taken")),
      isHandledError: (error) => error.status === 409,
      onError,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });

  it("still toasts errors the caller doesn't handle", async () => {
    const result = run({
      mutationFn: () => Promise.reject(new ApiError(500, "boom")),
      isHandledError: (error) => error.status === 409,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith("boom");
  });
});
