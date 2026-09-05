import { useAuth } from "@/features/auth/components/AuthContext";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { renderWithProviders } from "@/test/renderWithProviders";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getInitials, UserMenu } from "./UserMenu";

vi.mock("@/features/auth/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("@/features/auth/hooks/useLogout", () => ({
  useLogout: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseLogout = vi.mocked(useLogout);

const USER = {
  id: "u_1",
  email: "jamie@example.com",
  name: "Jamie M.",
  image: null,
  role: "FREE" as const,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("getInitials", () => {
  it("uses the first letter of up to two name parts", () => {
    expect(getInitials("Jamie Miller", "jamie@example.com")).toBe("JM");
  });

  it("falls back to a single letter for a one-word name", () => {
    expect(getInitials("Jamie", "jamie@example.com")).toBe("J");
  });

  it("falls back to the email's first letter with no name", () => {
    expect(getInitials(null, "jamie@example.com")).toBe("J");
  });

  it("falls back to the email's first letter for a blank name", () => {
    expect(getInitials("   ", "jamie@example.com")).toBe("J");
  });
});

describe("UserMenu", () => {
  it("renders nothing when there is no user", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    mockUseLogout.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useLogout>);

    const { container } = renderWithProviders(<UserMenu />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the user's initials and calls logout on click", async () => {
    const mutate = vi.fn();
    mockUseAuth.mockReturnValue({
      user: USER,
      isAuthenticated: true,
      isLoading: false,
    });
    mockUseLogout.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useLogout>);

    renderWithProviders(<UserMenu />);

    expect(screen.getByText("JM")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByLabelText("Account menu"));
    await user.click(await screen.findByText("Log out"));

    expect(mutate).toHaveBeenCalled();
  });

  it("always shows initials, even when the user has an avatar image", () => {
    mockUseAuth.mockReturnValue({
      user: { ...USER, image: "https://lh3.googleusercontent.com/a/abc=s96-c" },
      isAuthenticated: true,
      isLoading: false,
    });
    mockUseLogout.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useLogout>);

    renderWithProviders(<UserMenu />);

    expect(screen.getByText("JM")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
