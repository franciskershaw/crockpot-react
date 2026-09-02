import { useAuth } from "@/features/auth/AuthContext";
import { goToGoogleLogin } from "@/features/auth/googleLogin";
import { renderWithProviders } from "@/test/renderWithProviders";
import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MobileTabBar } from "./MobileTabBar";

vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("@/features/auth/googleLogin", () => ({
  goToGoogleLogin: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

afterEach(() => {
  vi.clearAllMocks();
});

describe("MobileTabBar", () => {
  it("shows Browse Recipes + Login when logged out", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithProviders(<MobileTabBar />);

    expect(screen.getByText("Browse Recipes")).toBeInTheDocument();
    const login = screen.getByText("Login");
    expect(login).toBeInTheDocument();
    expect(screen.queryByText("Your Crockpot")).not.toBeInTheDocument();

    fireEvent.click(login);
    expect(goToGoogleLogin).toHaveBeenCalled();
  });

  it("shows the app tabs, with Add Recipe disabled, when logged in", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "u_1",
        email: "jamie@example.com",
        name: "Jamie M.",
        image: null,
        role: "FREE",
      },
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<MobileTabBar />);

    expect(screen.getByText("Browse Recipes")).toBeInTheDocument();
    expect(screen.getByText("Your Crockpot")).toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();

    const addRecipe = screen.getByText("Add Recipe");
    expect(addRecipe.closest("span")).toHaveAttribute("aria-disabled", "true");
  });
});
