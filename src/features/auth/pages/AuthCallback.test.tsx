import { DEFAULT_AUTHENTICATED_ROUTE } from "@/app/routes";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "../components/AuthContext";
import { getAuthErrorMessage } from "../types";
import { AuthCallback } from "./AuthCallback";

vi.mock("../components/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

const mockUseAuth = vi.mocked(useAuth);
const mockToastError = vi.mocked(toast.error);

type AuthState = ReturnType<typeof useAuth>;

const loading: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};
const unauthed: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};
const authed: AuthState = {
  user: {
    id: "u_1",
    email: "founder@example.com",
    name: "Founder",
    image: null,
    role: "FREE",
  },
  isAuthenticated: true,
  isLoading: false,
};

function renderCallback(auth: AuthState, route = "/auth/callback") {
  mockUseAuth.mockReturnValue(auth);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/" element={<p>sign-in sink</p>} />
        <Route path={DEFAULT_AUTHENTICATED_ROUTE} element={<p>menu sink</p>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("AuthCallback", () => {
  it("fires one generic error toast and redirects to / when ?error is present", () => {
    renderCallback(loading, "/auth/callback?error=server_error");

    expect(mockToastError).toHaveBeenCalledTimes(1);
    expect(mockToastError).toHaveBeenCalledWith(
      getAuthErrorMessage("server_error"),
      { id: "auth-callback-error" },
    );
    expect(screen.getByText("sign-in sink")).toBeInTheDocument();
  });

  it("renders nothing while the session is still loading and there is no error", () => {
    renderCallback(loading);

    expect(screen.queryByText("sign-in sink")).not.toBeInTheDocument();
    expect(screen.queryByText("menu sink")).not.toBeInTheDocument();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("redirects to the default authenticated route once the session resolves authenticated", () => {
    renderCallback(authed);

    expect(screen.getByText("menu sink")).toBeInTheDocument();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("redirects to / once the session resolves unauthenticated", () => {
    renderCallback(unauthed);

    expect(screen.getByText("sign-in sink")).toBeInTheDocument();
    expect(screen.queryByText("menu sink")).not.toBeInTheDocument();
  });
});
