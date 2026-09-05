import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "./AuthContext";
import { RequireAuth } from "./RequireAuth";

vi.mock("./AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

type AuthState = ReturnType<typeof useAuth>;

function renderGuarded(auth: AuthState) {
  mockUseAuth.mockReturnValue(auth);
  return render(
    <MemoryRouter initialEntries={["/menu"]}>
      <Routes>
        <Route path="/" element={<p>sign-in sink</p>} />
        <Route
          path="/menu"
          element={
            <RequireAuth>
              <p>protected content</p>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("RequireAuth", () => {
  it("renders nothing while the session is still loading", () => {
    renderGuarded({ user: null, isAuthenticated: false, isLoading: true });

    expect(screen.queryByText("protected content")).not.toBeInTheDocument();
    expect(screen.queryByText("sign-in sink")).not.toBeInTheDocument();
  });

  it("redirects to / when the session has resolved and the user is unauthenticated", () => {
    renderGuarded({ user: null, isAuthenticated: false, isLoading: false });

    expect(screen.getByText("sign-in sink")).toBeInTheDocument();
    expect(screen.queryByText("protected content")).not.toBeInTheDocument();
  });

  it("renders its children when the user is authenticated", () => {
    renderGuarded({
      user: {
        id: "u_1",
        email: "founder@example.com",
        name: "Founder",
        image: null,
        role: "FREE",
      },
      isAuthenticated: true,
      isLoading: false,
    });

    expect(screen.getByText("protected content")).toBeInTheDocument();
    expect(screen.queryByText("sign-in sink")).not.toBeInTheDocument();
  });
});
