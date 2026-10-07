import { setupQueryClient } from "@/test/queryClientTestUtils";
import { renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { restockRegulars } from "../data/api";
import { shoppingListKeys } from "../data/queryKeys";
import { useRestockRegulars } from "./useRestockRegulars";

vi.mock("../data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/api")>()),
  restockRegulars: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockRestock = vi.mocked(restockRegulars);

afterEach(() => {
  vi.clearAllMocks();
});

describe("useRestockRegulars", () => {
  it("sends the chosen regulars and marks the list stale once it succeeds", async () => {
    const { queryClient, wrapper } = setupQueryClient([
      [shoppingListKeys.list(), { items: [] }],
    ]);
    mockRestock.mockResolvedValue({ message: "ok" });

    const { result } = renderHook(() => useRestockRegulars(), { wrapper });
    result.current.mutate(["reg_milk", "reg_eggs"]);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockRestock).toHaveBeenCalledWith(["reg_milk", "reg_eggs"]);
    expect(
      queryClient.getQueryState(shoppingListKeys.list())?.isInvalidated,
    ).toBe(true);
  });

  it("leaves the list alone when the restock fails", async () => {
    const { queryClient, wrapper } = setupQueryClient([
      [shoppingListKeys.list(), { items: [] }],
    ]);
    mockRestock.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useRestockRegulars(), { wrapper });
    result.current.mutate(["reg_milk"]);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(
      queryClient.getQueryState(shoppingListKeys.list())?.isInvalidated,
    ).toBe(false);
  });

  it("leaves the failure to the regulars view rather than toasting", async () => {
    const { wrapper } = setupQueryClient([]);
    mockRestock.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useRestockRegulars(), { wrapper });
    result.current.mutate(["reg_milk"]);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).not.toHaveBeenCalled();
  });
});
