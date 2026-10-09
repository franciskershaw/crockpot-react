import { approveRecipe, getRecipe } from "@/features/recipes/data/api";
import { recipeKeys } from "@/features/recipes/data/queryKeys";
import { ApiError } from "@/lib/http/client";
import { deferred, setupQueryClient } from "@/test/queryClientTestUtils";
import { buildRecipeDetail } from "@/test/recipeFixtures";
import { useQuery } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { isRecipeChanged, useApproveRecipe } from "./useApproveRecipe";

vi.mock("@/features/recipes/data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/recipes/data/api")>()),
  approveRecipe: vi.fn(),
  getRecipe: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const pending = buildRecipeDetail({
  id: "r_1",
  approved: false,
  updatedAt: "2026-10-09T10:00:00.123456Z",
});
const LIST_KEY = recipeKeys.list({ approved: false, limit: 12 });

function renderApprove() {
  const { queryClient, wrapper } = setupQueryClient([
    [recipeKeys.detail("r_1"), pending],
    [LIST_KEY, { pages: [], pageParams: [] }],
  ]);
  const hook = renderHook(
    () => ({
      detail: useQuery({
        queryKey: recipeKeys.detail("r_1"),
        queryFn: () => getRecipe("r_1"),
        staleTime: Infinity,
      }),
      approve: useApproveRecipe("r_1"),
    }),
    { wrapper },
  );
  return { queryClient, ...hook };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("useApproveRecipe", () => {
  it("approves against the loaded updatedAt, shows the approved recipe, and refreshes the lists", async () => {
    const approved = { ...pending, approved: true };
    vi.mocked(approveRecipe).mockResolvedValue(approved);
    const { queryClient, result } = renderApprove();

    act(() => result.current.approve.mutate(pending.updatedAt));

    await waitFor(() => expect(result.current.approve.isSuccess).toBe(true));
    expect(approveRecipe).toHaveBeenCalledWith(
      "r_1",
      "2026-10-09T10:00:00.123456Z",
    );
    expect(result.current.detail.data).toEqual(approved);
    expect(queryClient.getQueryState(LIST_KEY)?.isInvalidated).toBe(true);
    expect(toast.success).toHaveBeenCalledWith("Approved");
  });

  it("on recipe_changed, stays pending until the fresh recipe has loaded, without an error toast", async () => {
    vi.mocked(approveRecipe).mockRejectedValue(
      new ApiError(409, "recipe_changed"),
    );
    const fresh = deferred<typeof pending>();
    vi.mocked(getRecipe).mockReturnValue(fresh.promise);
    const { result } = renderApprove();

    act(() => result.current.approve.mutate(pending.updatedAt));

    await waitFor(() => expect(getRecipe).toHaveBeenCalledWith("r_1"));
    expect(result.current.approve.isPending).toBe(true);

    const changed = { ...pending, updatedAt: "2026-10-09T11:00:00Z" };
    fresh.resolve(changed);

    await waitFor(() => expect(result.current.approve.isError).toBe(true));
    expect(result.current.detail.data).toEqual(changed);
    expect(isRecipeChanged(result.current.approve.error)).toBe(true);
    expect(toast.error).not.toHaveBeenCalled();
  });
});
