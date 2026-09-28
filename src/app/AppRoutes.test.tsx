import { Suspense, useEffect } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, MemoryRouter, Outlet, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { AppRoutes } from "./AppRoutes";

vi.mock("@/features/auth/components/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true, isLoading: false }),
}));
vi.mock("@/features/auth/components/RequireAuth", () => ({
  RequireAuth: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@/components/nav/AppShell", () => ({ AppShell: () => <Outlet /> }));
const layoutMounts = vi.hoisted(() => ({ count: 0 }));
vi.mock("@/features/your-crockpot/pages/YourCrockpotLayout", () => ({
  YourCrockpotLayout: function YourCrockpotLayout() {
    useEffect(() => {
      layoutMounts.count += 1;
    }, []);
    return (
      <>
        <Link to="/library">Library</Link>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </>
    );
  },
}));
vi.mock("@/features/menu/pages/MenuPage", () => ({
  MenuPage: () => <p>menu page</p>,
}));
vi.mock("@/features/your-crockpot/pages/FavouritesPage", () => ({
  FavouritesPage: () => <p>favourites page</p>,
}));
vi.mock("@/features/your-crockpot/pages/MyRecipesPage", () => ({
  MyRecipesPage: () => <p>my recipes page</p>,
}));

function CurrentPath() {
  return <output aria-label="path">{useLocation().pathname}</output>;
}

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
      <CurrentPath />
    </MemoryRouter>,
  );
}

describe("AppRoutes", () => {
  it.each([
    ["/library", "/library/favourites", "favourites page"],
    ["/favourites", "/library/favourites", "favourites page"],
    ["/my-recipes", "/library/my-recipes", "my recipes page"],
  ])("redirects %s to %s", async (from, to, content) => {
    renderAt(from);

    expect(await screen.findByText(content)).toBeInTheDocument();
    expect(screen.getByLabelText("path")).toHaveTextContent(to);
  });

  it("keeps the Your Crockpot layout mounted through the /library redirect", async () => {
    renderAt("/menu");
    await screen.findByText("menu page");
    layoutMounts.count = 0;

    await userEvent
      .setup()
      .click(screen.getByRole("link", { name: "Library" }));

    expect(await screen.findByText("favourites page")).toBeInTheDocument();
    expect(layoutMounts.count).toBe(0);
  });
});
