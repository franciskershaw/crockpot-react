import { useAddToMenu } from "@/features/menu/hooks/useAddToMenu";
import { useMenuEntry } from "@/features/menu/hooks/useMenuEntry";
import { useRemoveFromMenu } from "@/features/menu/hooks/useRemoveFromMenu";
import { useUpdateMenuEntryServes } from "@/features/menu/hooks/useUpdateMenuEntryServes";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useToggleFavourite } from "../hooks/useToggleFavourite";
import { MobileRecipeRow } from "./MobileRecipeRow";

vi.mock("@/features/menu/hooks/useMenuEntry", () => ({
  useMenuEntry: vi.fn(),
}));
vi.mock("@/features/menu/hooks/useAddToMenu", () => ({
  useAddToMenu: vi.fn(),
}));
vi.mock("@/features/menu/hooks/useUpdateMenuEntryServes", () => ({
  useUpdateMenuEntryServes: vi.fn(),
}));
vi.mock("@/features/menu/hooks/useRemoveFromMenu", () => ({
  useRemoveFromMenu: vi.fn(),
}));
vi.mock("../hooks/useToggleFavourite", () => ({
  useToggleFavourite: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

const recipe = buildRecipeCard({
  name: "Smoky Bean Tacos",
  timeInMinutes: 25,
  isFavourite: true,
});

function setup({
  onRemoveFromMenu = vi.fn(),
  onUnfavourite,
  isInMenu = true,
  menuPending = false,
}: {
  onRemoveFromMenu?: () => void;
  onUnfavourite?: () => void;
  isInMenu?: boolean;
  menuPending?: boolean;
} = {}) {
  vi.mocked(useMenuEntry).mockReturnValue({
    isInMenu,
    serves: isInMenu ? 6 : undefined,
    isPending: menuPending,
  });
  const updateServes = { mutate: vi.fn(), isPending: false };
  const removeFromMenu = { mutate: vi.fn(), isPending: false };
  const addToMenu = { mutate: vi.fn(), isPending: false };
  vi.mocked(useAddToMenu).mockReturnValue(
    addToMenu as unknown as ReturnType<typeof useAddToMenu>,
  );
  vi.mocked(useUpdateMenuEntryServes).mockReturnValue(
    updateServes as unknown as ReturnType<typeof useUpdateMenuEntryServes>,
  );
  vi.mocked(useRemoveFromMenu).mockReturnValue(
    removeFromMenu as unknown as ReturnType<typeof useRemoveFromMenu>,
  );
  const toggleFavourite = { mutate: vi.fn() };
  vi.mocked(useToggleFavourite).mockReturnValue(
    toggleFavourite as unknown as ReturnType<typeof useToggleFavourite>,
  );

  render(
    <MemoryRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MobileRecipeRow
              recipe={recipe}
              from="/menu"
              onRemoveFromMenu={onRemoveFromMenu}
              onUnfavourite={onUnfavourite}
            />
          }
        />
        <Route path="/recipes/:id" element={<p>Recipe detail page</p>} />
      </Routes>
    </MemoryRouter>,
  );
  return {
    addToMenu,
    updateServes,
    removeFromMenu,
    onRemoveFromMenu,
    toggleFavourite,
  };
}

function servesPill() {
  return screen.getByRole("button", { name: "Edit menu item" });
}

describe("MobileRecipeRow", () => {
  it("shows the recipe's name, time, favourite state and its serves on the menu", () => {
    setup();

    expect(screen.getByText("Smoky Bean Tacos")).toBeInTheDocument();
    expect(screen.getByText("25 mins")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove from favourites" }),
    ).toBeInTheDocument();
    expect(servesPill()).toHaveTextContent("6");
  });

  it("offers to add a recipe that isn't on the menu, without a serves count", () => {
    setup({ isInMenu: false });

    expect(
      screen.getByRole("button", { name: "Add to menu" }),
    ).not.toHaveTextContent(/\d/);
    expect(
      screen.queryByRole("button", { name: "Edit menu item" }),
    ).not.toBeInTheDocument();
  });

  it("adds a recipe to the menu at its own serves from the editor", async () => {
    const { addToMenu } = setup({ isInMenu: false });

    await userEvent.click(screen.getByRole("button", { name: "Add to menu" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Confirm amount" }),
    );

    expect(addToMenu.mutate).toHaveBeenCalledWith({
      recipe,
      serves: recipe.serves,
    });
  });

  it("hands un-hearting to onUnfavourite instead of toggling itself", async () => {
    const onUnfavourite = vi.fn();
    const { toggleFavourite } = setup({ onUnfavourite });

    await userEvent.click(
      screen.getByRole("button", { name: "Remove from favourites" }),
    );

    expect(onUnfavourite).toHaveBeenCalledTimes(1);
    expect(toggleFavourite.mutate).not.toHaveBeenCalled();
    expect(screen.queryByText("Recipe detail page")).not.toBeInTheDocument();
  });

  it("opens the recipe, remembering where it came from", async () => {
    setup();

    await userEvent.click(screen.getByText("Smoky Bean Tacos"));

    expect(screen.getByText("Recipe detail page")).toBeInTheDocument();
  });

  it("opens the serves editor over the row without leaving the page", async () => {
    setup();

    await userEvent.click(servesPill());

    expect(screen.queryByText("Recipe detail page")).not.toBeInTheDocument();
    for (const name of [
      "Cancel",
      "Decrease servings",
      "Increase servings",
      "Confirm amount",
      "Remove from menu",
    ]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("doesn't open the recipe when a click lands between the row's action buttons", () => {
    setup();

    fireEvent.click(servesPill().parentElement!);

    expect(screen.queryByText("Recipe detail page")).not.toBeInTheDocument();
  });

  it("doesn't open the recipe when the disabled cart is clicked while the menu loads", () => {
    setup({ menuPending: true });

    fireEvent.click(
      screen.getByRole("button", { name: "Loading menu status" }),
    );

    expect(screen.queryByText("Recipe detail page")).not.toBeInTheDocument();
  });

  it("closes the editor on cancel", async () => {
    setup();

    await userEvent.click(servesPill());
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Remove from menu" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("saves the new serves on confirm", async () => {
    const { updateServes } = setup();

    await userEvent.click(servesPill());
    await userEvent.click(
      screen.getByRole("button", { name: "Increase servings" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Confirm amount" }),
    );

    expect(updateServes.mutate).toHaveBeenCalledWith({
      recipeId: recipe.id,
      serves: 7,
    });
  });

  it("hands removal to the page so it can offer undo", async () => {
    const { removeFromMenu, onRemoveFromMenu } = setup();

    await userEvent.click(servesPill());
    await userEvent.click(
      await screen.findByRole("button", { name: "Remove from menu" }),
    );

    expect(onRemoveFromMenu).toHaveBeenCalled();
    expect(removeFromMenu.mutate).not.toHaveBeenCalled();
  });
});
