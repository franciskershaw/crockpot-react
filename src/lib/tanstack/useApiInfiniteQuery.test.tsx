import { setupQueryClient } from "@/test/queryClientTestUtils";
import { renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, SessionExpiredError } from "../http/client";
import { useApiInfiniteQuery } from "./useApiInfiniteQuery";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function run(error: Error) {
  const { wrapper } = setupQueryClient();
  const { result } = renderHook(
    () =>
      useApiInfiniteQuery({
        queryKey: ["things"],
        queryFn: () => Promise.reject(error),
        initialPageParam: 1,
        getNextPageParam: () => undefined,
      }),
    { wrapper },
  );
  return result;
}

describe("useApiInfiniteQuery", () => {
  it("toasts a failed page fetch", async () => {
    const result = run(new ApiError(500, "boom"));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith("boom");
  });

  it("doesn't toast an expired session, but still ends in error", async () => {
    const result = run(new SessionExpiredError());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).not.toHaveBeenCalled();
  });
});
