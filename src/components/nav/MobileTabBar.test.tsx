import { useAuth } from "@/features/auth/components/AuthContext";
import { buildUser } from "@/test/authFixtures";
import { renderWithProviders } from "@/test/renderWithProviders";
import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MobileTabBar } from "./MobileTabBar";

vi.mock("@/features/auth/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

afterEach(() => {
  vi.clearAllMocks();
});

describe("MobileTabBar", () => {
  it("shows Browse recipes + Sign in when logged out", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithProviders(<MobileTabBar />);

    expect(screen.getByText("Browse recipes")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.queryByText("Your Crockpot")).not.toBeInTheDocument();
  });

  it("shows the app tabs when logged in", () => {
    mockUseAuth.mockReturnValue({
      user: buildUser(),
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<MobileTabBar />);

    expect(screen.getByText("Browse recipes")).toBeInTheDocument();
    expect(screen.getByText("Your Crockpot")).toBeInTheDocument();
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Add recipe/ })).toHaveAttribute(
      "href",
      "/recipes/new",
    );
  });

  it("marks Add recipe as current on the add-recipe page", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<MobileTabBar />, { route: "/recipes/new" });

    expect(screen.getByRole("link", { name: /Add recipe/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marks Your Crockpot as current on any of its tabs", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<MobileTabBar />, { route: "/library/favourites" });

    expect(screen.getByRole("link", { name: /Your Crockpot/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
