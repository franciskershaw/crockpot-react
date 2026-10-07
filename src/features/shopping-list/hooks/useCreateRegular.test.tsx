import { ApiError } from "@/lib/http/client";
import { setupQueryClient } from "@/test/queryClientTestUtils";
import { buildRegular } from "@/test/shoppingListFixtures";
import { renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRegular } from "../data/api";
import { regularsKeys } from "../data/queryKeys";
import { useCreateRegular } from "./useCreateRegular";

vi.mock("../data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/api")>()),
  createRegular: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockCreate = vi.mocked(createRegular);
const input = { itemId: "i_milk", quantity: 2, unitId: "u_pt" };

afterEach(() => {
  vi.clearAllMocks();
});

describe("useCreateRegular", () => {
  it("creates the regular and marks the regulars stale", async () => {
    const { queryClient, wrapper } = setupQueryClient([
      [regularsKeys.list(), []],
    ]);
    mockCreate.mockResolvedValue(buildRegular());

    const { result } = renderHook(() => useCreateRegular(), { wrapper });
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreate).toHaveBeenCalledWith(input);
    expect(queryClient.getQueryState(regularsKeys.list())?.isInvalidated).toBe(
      true,
    );
  });

  it("leaves a conflict to the edit view rather than toasting", async () => {
    const { wrapper } = setupQueryClient([]);
    mockCreate.mockRejectedValue(new ApiError(409, "regular_exists"));

    const { result } = renderHook(() => useCreateRegular(), { wrapper });
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("still toasts any other failure", async () => {
    const { wrapper } = setupQueryClient([]);
    mockCreate.mockRejectedValue(
      new ApiError(400, "unit_not_allowed_for_item"),
    );

    const { result } = renderHook(() => useCreateRegular(), { wrapper });
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });
});
