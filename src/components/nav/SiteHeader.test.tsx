import { useAuth } from "@/features/auth/components/AuthContext";
import { buildUser } from "@/test/authFixtures";
import { renderWithProviders } from "@/test/renderWithProviders";
import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "./SiteHeader";

vi.mock("@/features/auth/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("@/features/auth/hooks/useLogout", () => ({
  useLogout: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

const mockUseAuth = vi.mocked(useAuth);

afterEach(() => {
  vi.clearAllMocks();
});

describe("SiteHeader", () => {
  it("shows the marketing nav and a Sign in button when logged out", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithProviders(<SiteHeader />);

    expect(screen.getByText("Browse recipes")).toBeInTheDocument();
    expect(screen.getByText("How it works")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
    expect(screen.queryByText("Your Crockpot")).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("shows the app nav and account menu when logged in", () => {
    mockUseAuth.mockReturnValue({
      user: buildUser(),
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<SiteHeader />);

    expect(screen.getByText("Browse recipes")).toBeInTheDocument();
    expect(screen.getByText("Your Crockpot")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add a recipe" })).toHaveAttribute(
      "href",
      "/recipes/new",
    );
    expect(screen.getByLabelText("Account menu")).toBeInTheDocument();
    expect(screen.queryByText("How it works")).not.toBeInTheDocument();
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
  });

  it("marks Your Crockpot as current on any of its tabs", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<SiteHeader />, { route: "/library/favourites" });

    expect(screen.getByRole("link", { name: /Your Crockpot/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marks Add a recipe as current on the add-recipe page", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<SiteHeader />, { route: "/recipes/new" });

    expect(screen.getByRole("link", { name: "Add a recipe" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("leaves Browse recipes unmarked on the add-recipe page", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<SiteHeader />, { route: "/recipes/new" });

    expect(
      screen.getByRole("link", { name: "Browse recipes" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("marks Browse recipes as current on a recipe page", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<SiteHeader />, { route: "/recipes/abc" });

    expect(
      screen.getByRole("link", { name: "Browse recipes" }),
    ).toHaveAttribute("aria-current", "page");
  });
});
