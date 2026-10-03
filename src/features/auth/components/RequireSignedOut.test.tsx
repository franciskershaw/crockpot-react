import { DEFAULT_AUTHENTICATED_ROUTE } from "@/app/routes";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "./AuthContext";
import { RequireSignedOut } from "./RequireSignedOut";

vi.mock("./AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

type AuthState = ReturnType<typeof useAuth>;

function renderGuarded(auth: AuthState) {
  mockUseAuth.mockReturnValue(auth);
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route
          path={DEFAULT_AUTHENTICATED_ROUTE}
          element={<p>signed-in home</p>}
        />
        <Route
          path="/login"
          element={
            <RequireSignedOut>
              <p>sign-in form</p>
            </RequireSignedOut>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("RequireSignedOut", () => {
  it("renders nothing while the session is still loading", () => {
    renderGuarded({ user: null, isAuthenticated: false, isLoading: true });

    expect(screen.queryByText("sign-in form")).not.toBeInTheDocument();
    expect(screen.queryByText("signed-in home")).not.toBeInTheDocument();
  });

  it("sends a signed-in user to the signed-in home", () => {
    renderGuarded({
      user: {
        id: "u_1",
        email: "jamie@example.com",
        name: "Jamie Alder",
        image: null,
        role: "FREE",
      },
      isAuthenticated: true,
      isLoading: false,
    });

    expect(screen.getByText("signed-in home")).toBeInTheDocument();
    expect(screen.queryByText("sign-in form")).not.toBeInTheDocument();
  });

  it("shows its page to a signed-out visitor", () => {
    renderGuarded({ user: null, isAuthenticated: false, isLoading: false });

    expect(screen.getByText("sign-in form")).toBeInTheDocument();
  });
});
