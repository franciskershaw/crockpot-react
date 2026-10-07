import { setupQueryClient } from "@/test/queryClientTestUtils";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { deleteRegular } from "../data/api";
import { regularsKeys } from "../data/queryKeys";
import { useDeleteRegular } from "./useDeleteRegular";

vi.mock("../data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/api")>()),
  deleteRegular: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockDelete = vi.mocked(deleteRegular);

afterEach(() => {
  vi.clearAllMocks();
});

describe("useDeleteRegular", () => {
  it("deletes the regular and marks the regulars stale", async () => {
    const { queryClient, wrapper } = setupQueryClient([
      [regularsKeys.list(), []],
    ]);
    mockDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteRegular(), { wrapper });
    result.current.mutate({ id: "reg_milk" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockDelete).toHaveBeenCalledWith("reg_milk");
    expect(queryClient.getQueryState(regularsKeys.list())?.isInvalidated).toBe(
      true,
    );
  });
});
