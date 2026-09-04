import { useAuth } from "@/features/auth/AuthContext";
import { goToGoogleLogin } from "@/features/auth/googleLogin";
import { renderWithProviders } from "@/test/renderWithProviders";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "./SiteHeader";

vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("@/features/auth/useLogout", () => ({
  useLogout: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));
vi.mock("@/features/auth/googleLogin", () => ({
  goToGoogleLogin: vi.fn(),
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

    await userEvent.setup().click(screen.getByText("Sign in"));
    expect(goToGoogleLogin).toHaveBeenCalled();
  });

  it("shows the app nav and account menu when logged in", () => {
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

    renderWithProviders(<SiteHeader />);

    expect(screen.getByText("Browse recipes")).toBeInTheDocument();
    expect(screen.getByText("Your Crockpot")).toBeInTheDocument();
    expect(screen.getByText("Add a recipe")).toBeInTheDocument();
    expect(screen.getByLabelText("Account menu")).toBeInTheDocument();
    expect(screen.queryByText("How it works")).not.toBeInTheDocument();
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
  });
});
