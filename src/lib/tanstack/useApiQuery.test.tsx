import { setupQueryClient } from "@/test/queryClientTestUtils";
import { renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, SessionExpiredError } from "../http/client";
import { useApiQuery } from "./useApiQuery";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function run(error: Error) {
  const { wrapper } = setupQueryClient();
  const { result } = renderHook(
    () =>
      useApiQuery({
        queryKey: ["thing"],
        queryFn: () => Promise.reject(error),
      }),
    { wrapper },
  );
  return result;
}

describe("useApiQuery", () => {
  it("toasts a failed fetch", async () => {
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
