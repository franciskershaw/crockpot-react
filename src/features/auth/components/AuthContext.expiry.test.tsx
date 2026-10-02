import { type ReactNode } from "react";
import { apiFetch } from "@/lib/http/client";
import { setAccessToken } from "@/lib/http/tokenStore";
import { useApiQuery } from "@/lib/tanstack/useApiQuery";
import { setupQueryClient } from "@/test/queryClientTestUtils";
import { renderWithProviders } from "@/test/renderWithProviders";
import { renderHook, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { User } from "../data/types";
import { AuthProvider, useAuth } from "./AuthContext";
import { RequireAuth } from "./RequireAuth";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}));

const user: User = {
  id: "u_1",
  email: "founder@example.com",
  name: "Founder",
  image: null,
  role: "FREE",
};

function respond(ok: boolean, status: number, body: unknown = {}) {
  return {
    ok,
    status,
    headers: new Headers(),
    json: () => Promise.resolve(body),
  } as Response;
}

// Boot signs the user in; every later refresh is rejected, as after a revocation.
function serverThatRevokes({ signedIn = true } = {}) {
  let refreshes = 0;
  vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = String(input);
    if (url.endsWith("/auth/refresh")) {
      refreshes++;
      return Promise.resolve(
        signedIn && refreshes === 1
          ? respond(true, 200, { accessToken: "boot-token" })
          : respond(false, 401, { error: "invalid_refresh_token" }),
      );
    }
    if (url.endsWith("/me")) return Promise.resolve(respond(true, 200, user));
    return Promise.resolve(respond(false, 401, { error: "unauthorized" }));
  });
}

function renderAuth() {
  const { queryClient, wrapper: queryWrapper } = setupQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) =>
    queryWrapper({ children: <AuthProvider>{children}</AuthProvider> });
  return { queryClient, ...renderHook(() => useAuth(), { wrapper }) };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  setAccessToken(null);
});

describe("AuthProvider when the session expires", () => {
  it("signs the user out, wipes their caches and says so once", async () => {
    serverThatRevokes();
    const { queryClient, result } = renderAuth();
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    queryClient.setQueryData(["menu"], { entries: [] });

    await Promise.allSettled([apiFetch("/menu"), apiFetch("/shopping-list")]);

    await waitFor(() => expect(result.current.isAuthenticated).toBe(false));
    expect(queryClient.getQueryData(["menu"])).toBeUndefined();
    expect(toast.info).toHaveBeenCalledTimes(1);
    expect(toast.info).toHaveBeenCalledWith(
      "Your session has ended. Please sign in again.",
      { id: "session-expired" },
    );
  });

  it("stays quiet for a visitor who was never signed in", async () => {
    serverThatRevokes({ signedIn: false });
    const { result } = renderAuth();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(toast.info).not.toHaveBeenCalled();
  });

  it("stops listening once unmounted", async () => {
    serverThatRevokes();
    const { result, unmount } = renderAuth();
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    unmount();

    await apiFetch("/menu").catch(() => {});

    expect(toast.info).not.toHaveBeenCalled();
  });
});

function MenuProbe() {
  useApiQuery({ queryKey: ["menu"], queryFn: () => apiFetch("/menu") });
  return <p>Menu page</p>;
}

describe("a protected page when the session expires", () => {
  it("sends the user home with one toast and no error toasts", async () => {
    serverThatRevokes();

    renderWithProviders(
      <AuthProvider>
        <Routes>
          <Route path="/" element={<p>Home page</p>} />
          <Route
            path="/menu"
            element={
              <RequireAuth>
                <MenuProbe />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>,
      { route: "/menu" },
    );

    expect(await screen.findByText("Home page")).toBeInTheDocument();
    expect(toast.info).toHaveBeenCalledTimes(1);
    expect(toast.error).not.toHaveBeenCalled();
  });
});
