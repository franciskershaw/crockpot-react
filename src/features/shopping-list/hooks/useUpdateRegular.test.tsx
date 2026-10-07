import { setupQueryClient } from "@/test/queryClientTestUtils";
import { buildRegular } from "@/test/shoppingListFixtures";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { updateRegular } from "../data/api";
import { regularsKeys } from "../data/queryKeys";
import { useUpdateRegular } from "./useUpdateRegular";

vi.mock("../data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/api")>()),
  updateRegular: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockUpdate = vi.mocked(updateRegular);

afterEach(() => {
  vi.clearAllMocks();
});

describe("useUpdateRegular", () => {
  it("sends the new quantity and unit and marks the regulars stale", async () => {
    const { queryClient, wrapper } = setupQueryClient([
      [regularsKeys.list(), []],
    ]);
    mockUpdate.mockResolvedValue(buildRegular());

    const { result } = renderHook(() => useUpdateRegular(), { wrapper });
    result.current.mutate({ id: "reg_milk", quantity: 4, unitId: null });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockUpdate).toHaveBeenCalledWith("reg_milk", {
      quantity: 4,
      unitId: null,
    });
    expect(queryClient.getQueryState(regularsKeys.list())?.isInvalidated).toBe(
      true,
    );
  });
});
