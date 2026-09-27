import { useMenu } from "@/features/menu/hooks/useMenu";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { YourCrockpotLayout } from "./YourCrockpotLayout";

vi.mock("@/features/menu/hooks/useMenu", () => ({ useMenu: vi.fn() }));
vi.mock("@/features/menu/components/MenuActionsMenu", () => ({
  MenuActionsMenu: () => <button type="button">More menu actions</button>,
}));

function actionsMenu() {
  return screen.queryByRole("button", { name: "More menu actions" });
}

function renderAt(path: string, recipeCount: number | null = 2) {
  vi.mocked(useMenu).mockReturnValue({
    data:
      recipeCount === null
        ? undefined
        : {
            entries: Array.from({ length: recipeCount }, (_, i) => ({
              recipeId: `r_${i}`,
              serves: 4,
              recipe: buildRecipeCard({ id: `r_${i}` }),
            })),
          },
  } as unknown as ReturnType<typeof useMenu>);
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<YourCrockpotLayout />}>
          <Route path="/menu" element={<p>menu content</p>} />
          <Route path="/favourites" element={<p>favourites content</p>} />
          <Route path="/my-recipes" element={<p>my recipes content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("YourCrockpotLayout", () => {
  it("titles the Menu tab with how many recipes are on it", () => {
    renderAt("/menu", 2);

    expect(
      screen.getByRole("heading", { level: 1, name: "Menu" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Your Crockpot · 2 recipes")).toBeInTheDocument();
    expect(screen.getByText("menu content")).toBeInTheDocument();
  });

  it("uses the singular for one recipe", () => {
    renderAt("/menu", 1);
    expect(screen.getByText("Your Crockpot · 1 recipe")).toBeInTheDocument();
  });

  it("says when nothing is on the menu", () => {
    renderAt("/menu", 0);
    expect(
      screen.getByText("Your Crockpot · nothing on the menu yet"),
    ).toBeInTheDocument();
  });

  it("titles the other tabs by name", () => {
    renderAt("/my-recipes");

    expect(
      screen.getByRole("heading", { level: 1, name: "My recipes" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Your Crockpot")).toBeInTheDocument();
    expect(screen.getByText("my recipes content")).toBeInTheDocument();
  });

  it("shows the tabs, marking the current one", () => {
    renderAt("/favourites");

    const tabs = screen.getByRole("navigation", { name: "Your Crockpot" });
    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual(
      ["Menu", "Favourites", "My recipes"],
    );
    expect(screen.getByRole("link", { name: "Favourites" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Menu" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(tabs).toBeInTheDocument();
  });

  it("offers the menu actions on the Menu tab", () => {
    renderAt("/menu", 2);
    expect(actionsMenu()).toBeInTheDocument();
  });

  it("hides the menu actions when there's nothing on the menu", () => {
    renderAt("/menu", 0);
    expect(actionsMenu()).not.toBeInTheDocument();
  });

  it("hides the menu actions on the other tabs", () => {
    renderAt("/favourites", 2);
    expect(actionsMenu()).not.toBeInTheDocument();
  });
});
