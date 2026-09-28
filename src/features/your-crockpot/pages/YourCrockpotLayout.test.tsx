import { useMenu } from "@/features/menu/hooks/useMenu";
import { buildRecipeCard } from "@/test/recipeFixtures";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { useFavourites } from "../hooks/useFavourites";
import { YourCrockpotLayout } from "./YourCrockpotLayout";

vi.mock("@/features/menu/hooks/useMenu", () => ({ useMenu: vi.fn() }));
vi.mock("../hooks/useFavourites", () => ({ useFavourites: vi.fn() }));
vi.mock("@/features/menu/components/MenuActionsMenu", () => ({
  MenuActionsMenu: () => <button type="button">More menu actions</button>,
}));

function actionsMenu() {
  return screen.queryByRole("button", { name: "More menu actions" });
}

function renderAt(
  path: string,
  recipeCount: number | null = 2,
  favouriteCount: number | null = null,
) {
  vi.mocked(useFavourites).mockReturnValue({
    data:
      favouriteCount === null
        ? undefined
        : {
            pages: [
              {
                recipes: [],
                page: 1,
                limit: 12,
                total: favouriteCount,
                totalPages: 1,
              },
            ],
            pageParams: [1],
          },
  } as unknown as ReturnType<typeof useFavourites>);
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
          <Route
            path="/library/favourites"
            element={<p>favourites content</p>}
          />
          <Route
            path="/library/my-recipes"
            element={<p>my recipes content</p>}
          />
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

  it("titles both Library sub-tabs Library", () => {
    renderAt("/library/my-recipes");

    expect(
      screen.getByRole("heading", { level: 1, name: "Library" }),
    ).toBeInTheDocument();
    expect(screen.getByText("my recipes content")).toBeInTheDocument();
  });

  it("shows the tabs and Library's sub-tabs, marking the current ones", () => {
    renderAt("/library/favourites");

    const tabs = screen.getByRole("navigation", { name: "Your Crockpot" });
    const subTabs = screen.getByRole("navigation", { name: "Library" });
    expect(
      within(tabs)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(["Menu 2", "Library"]);
    expect(
      within(subTabs)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(["Favourites", "My recipes"]);
    expect(within(tabs).getByRole("link", { name: "Library" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      within(tabs).getByRole("link", { name: "Menu 2" }),
    ).not.toHaveAttribute("aria-current");
    expect(
      within(subTabs).getByRole("link", { name: "Favourites" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(subTabs).getByRole("link", { name: "My recipes" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("links Library straight to Favourites, marking it current on either sub-tab", () => {
    renderAt("/library/my-recipes");

    const library = within(
      screen.getByRole("navigation", { name: "Your Crockpot" }),
    ).getByRole("link", { name: "Library" });
    expect(library).toHaveAttribute("href", "/library/favourites");
    expect(library).toHaveAttribute("aria-current", "page");
  });

  it("has no sub-tabs on the Menu tab", () => {
    renderAt("/menu");
    expect(
      screen.queryByRole("navigation", { name: "Library" }),
    ).not.toBeInTheDocument();
  });

  it("subtitles Library with how many recipes are favourited", () => {
    renderAt("/library/favourites", 2, 24);
    expect(
      screen.getByText("Your Crockpot · 24 favourites"),
    ).toBeInTheDocument();
  });

  it("keeps the same subtitle on My recipes", () => {
    renderAt("/library/my-recipes", 2, 24);
    expect(
      screen.getByText("Your Crockpot · 24 favourites"),
    ).toBeInTheDocument();
  });

  it("uses the singular for one favourite", () => {
    renderAt("/library/favourites", 2, 1);
    expect(screen.getByText("Your Crockpot · 1 favourite")).toBeInTheDocument();
  });

  it("says when nothing is saved", () => {
    renderAt("/library/favourites", 2, 0);
    expect(
      screen.getByText("Your Crockpot · no saved recipes yet"),
    ).toBeInTheDocument();
  });

  it("subtitles Library plainly while the favourites count is loading", () => {
    renderAt("/library/favourites", 2, null);
    expect(screen.getByText("Your Crockpot")).toBeInTheDocument();
  });

  it("counts Menu and Favourites, but not Library or My recipes", () => {
    renderAt("/library/favourites", 6, 24);

    expect(screen.getByRole("link", { name: "Menu 6" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Library" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Favourites 24" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "My recipes" }),
    ).toBeInTheDocument();
  });

  it("shows no count until a tab's data loads, and 0 once it has", () => {
    renderAt("/library/favourites", 0, null);

    expect(screen.getByRole("link", { name: "Menu 0" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Favourites" }),
    ).toBeInTheDocument();
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
    renderAt("/library/favourites", 2);
    expect(actionsMenu()).not.toBeInTheDocument();
  });
});
