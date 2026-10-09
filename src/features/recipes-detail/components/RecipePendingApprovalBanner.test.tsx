import { useAuth } from "@/features/auth/components/AuthContext";
import { approveRecipe, getRecipe } from "@/features/recipes/data/api";
import type { RecipeDetail } from "@/features/recipes/data/types";
import { ApiError } from "@/lib/http/client";
import { buildUser } from "@/test/authFixtures";
import { deferred, setupQueryClient } from "@/test/queryClientTestUtils";
import { buildRecipeDetail } from "@/test/recipeFixtures";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RecipePendingApprovalBanner } from "./RecipePendingApprovalBanner";

vi.mock("@/features/auth/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("@/features/recipes/data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/recipes/data/api")>()),
  approveRecipe: vi.fn(),
  getRecipe: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const pending = buildRecipeDetail({
  id: "r_1",
  createdById: "u_owner",
  approved: false,
  updatedAt: "2026-10-09T10:00:00Z",
});

function signInAs(id: string, role: "ADMIN" | "FREE") {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: true,
    user: buildUser({ id, role }),
  } as ReturnType<typeof useAuth>);
}

function renderBanner(recipe: RecipeDetail) {
  const { wrapper } = setupQueryClient();
  return render(<RecipePendingApprovalBanner recipe={recipe} />, { wrapper });
}

const approveButton = () => screen.getByRole("button", { name: "Approve" });

afterEach(() => {
  vi.clearAllMocks();
});

describe("RecipePendingApprovalBanner", () => {
  it("tells the owner it's pending, with nothing to press", () => {
    signInAs("u_owner", "FREE");
    renderBanner(pending);

    expect(
      screen.getByText(
        "Pending approval — visible only to you until an admin approves it",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("lets an admin approve the version on screen, once at a time", async () => {
    signInAs("u_admin", "ADMIN");
    const request = deferred<RecipeDetail>();
    vi.mocked(approveRecipe).mockReturnValue(request.promise);
    renderBanner(pending);

    expect(
      screen.getByText(
        "Pending approval — check the photo and details before approving",
      ),
    ).toBeInTheDocument();
    await userEvent.click(approveButton());

    expect(approveRecipe).toHaveBeenCalledWith("r_1", "2026-10-09T10:00:00Z");
    expect(approveButton()).toBeDisabled();
  });

  it("says when the recipe changed, and approves the fresh version next time", async () => {
    signInAs("u_admin", "ADMIN");
    const changed = { ...pending, updatedAt: "2026-10-09T11:00:00Z" };
    vi.mocked(approveRecipe).mockRejectedValueOnce(
      new ApiError(409, "recipe_changed"),
    );
    vi.mocked(getRecipe).mockResolvedValue(changed);
    const { rerender } = renderBanner(pending);

    await userEvent.click(approveButton());

    expect(
      await screen.findByText(
        "This recipe changed since you opened it — check it again",
      ),
    ).toBeInTheDocument();

    vi.mocked(approveRecipe).mockReturnValue(deferred<RecipeDetail>().promise);
    rerender(<RecipePendingApprovalBanner recipe={changed} />);
    await userEvent.click(approveButton());

    expect(approveRecipe).toHaveBeenLastCalledWith(
      "r_1",
      "2026-10-09T11:00:00Z",
    );
    expect(
      screen.queryByText(
        "This recipe changed since you opened it — check it again",
      ),
    ).not.toBeInTheDocument();
  });
});
