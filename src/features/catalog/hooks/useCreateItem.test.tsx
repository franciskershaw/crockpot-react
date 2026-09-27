import { setupQueryClient } from "@/test/queryClientTestUtils";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createItem } from "../data/api";
import { catalogKeys } from "../data/queryKeys";
import { useCreateItem } from "./useCreateItem";

vi.mock("../data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/api")>()),
  createItem: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockCreateItem = vi.mocked(createItem);

afterEach(() => {
  vi.clearAllMocks();
});

describe("useCreateItem", () => {
  it("creates the item and marks the catalog stale so it becomes searchable", async () => {
    const { queryClient, wrapper } = setupQueryClient([
      [catalogKeys.items, []],
    ]);
    const created = {
      id: "i_new",
      name: "Gochujang",
      categoryId: "c_1",
      allowedUnitIds: [],
    };
    mockCreateItem.mockResolvedValue(created);

    const { result } = renderHook(() => useCreateItem(), { wrapper });
    const input = { name: "Gochujang", categoryId: "c_1", allowedUnitIds: [] };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreateItem).toHaveBeenCalledWith(input);
    expect(result.current.data).toEqual(created);
    expect(queryClient.getQueryState(catalogKeys.items)?.isInvalidated).toBe(
      true,
    );
  });
});
