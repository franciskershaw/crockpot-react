import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useDeleteRecipe } from "../hooks/useDeleteRecipe";
import { RecipeDeleteButton } from "./RecipeDeleteButton";

vi.mock("../hooks/useDeleteRecipe", () => ({
  useDeleteRecipe: vi.fn(),
}));

const mockUseDeleteRecipe = vi.mocked(useDeleteRecipe);

afterEach(() => {
  vi.clearAllMocks();
});

function setup({ isPending = false }: { isPending?: boolean } = {}) {
  const mutate = vi.fn();
  mockUseDeleteRecipe.mockReturnValue({
    mutate,
    isPending,
  } as unknown as ReturnType<typeof useDeleteRecipe>);
  return { mutate };
}

function renderButton() {
  return render(
    <MemoryRouter initialEntries={["/recipes/r_1"]}>
      <Routes>
        <Route path="/recipes" element={<p>recipes sink</p>} />
        <Route
          path="/recipes/:id"
          element={
            <RecipeDeleteButton
              recipeId="r_1"
              recipeName="BBQ Pulled Pork"
              to="/recipes"
            />
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RecipeDeleteButton", () => {
  it("opens a confirmation dialog naming the recipe", async () => {
    setup();
    renderButton();

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Delete recipe" }));

    expect(
      screen.getByText(/Are you sure you want to delete "BBQ Pulled Pork"/),
    ).toBeInTheDocument();
  });

  it("cancelling closes the dialog without deleting", async () => {
    const { mutate } = setup();
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole("button", { name: "Delete recipe" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mutate).not.toHaveBeenCalled();
    expect(
      screen.queryByText(/Are you sure you want to delete/),
    ).not.toBeInTheDocument();
  });

  it("confirming deletes and navigates to the given destination on success", async () => {
    const mutate = vi.fn((_recipeId, options) => options?.onSuccess?.());
    mockUseDeleteRecipe.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteRecipe>);
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole("button", { name: "Delete recipe" }));
    const dialog = within(screen.getByRole("dialog"));
    await user.click(dialog.getByRole("button", { name: "Delete recipe" }));

    expect(mutate).toHaveBeenCalledWith("r_1", expect.anything());
    expect(await screen.findByText("recipes sink")).toBeInTheDocument();
  });

  it("disables both dialog buttons while the deletion is pending", async () => {
    setup({ isPending: true });
    renderButton();

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Delete recipe" }));

    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(dialog.getByRole("button", { name: "Deleting…" })).toBeDisabled();
  });
});
