import { useAuth } from "@/features/auth/components/AuthContext";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { buildUser } from "@/test/authFixtures";
import { renderWithProviders } from "@/test/renderWithProviders";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { UserMenu } from "./UserMenu";

vi.mock("@/features/auth/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("@/features/auth/hooks/useLogout", () => ({
  useLogout: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseLogout = vi.mocked(useLogout);

const USER = buildUser({ name: "Jamie M." });

function CurrentPath() {
  return <output aria-label="path">{useLocation().pathname}</output>;
}

afterEach(() => {
  vi.clearAllMocks();
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

  it("links to account settings", async () => {
    mockUseAuth.mockReturnValue({
      user: USER,
      isAuthenticated: true,
      isLoading: false,
    });
    mockUseLogout.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useLogout>);

    renderWithProviders(
      <>
        <UserMenu />
        <CurrentPath />
      </>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByLabelText("Account menu"));
    await user.click(
      await screen.findByRole("menuitem", { name: "Account settings" }),
    );

    expect(screen.getByLabelText("path")).toHaveTextContent("/account");
  });
});
