import { type ReactNode } from "react";
import { getAccessToken, setAccessToken } from "@/lib/http/tokenStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { logout } from "../api";
import {
  AUTH_SESSION_QUERY_KEY,
  AuthProvider,
  useAuth,
} from "../components/AuthContext";
import type { User } from "../types";
import { useLogout } from "./useLogout";

vi.mock("../api", () => ({
  fetchMe: vi.fn(),
  logout: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const mockLogout = vi.mocked(logout);
const mockToastError = vi.mocked(toast.error);
const mockToastSuccess = vi.mocked(toast.success);

const user: User = {
  id: "u_1",
  email: "founder@example.com",
  name: "Founder",
  image: null,
  role: "FREE",
};

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, user);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

afterEach(() => {
  vi.clearAllMocks();
  setAccessToken(null);
});

describe("useLogout", () => {
  it("clears the access token and session cache after a successful logout", async () => {
    mockLogout.mockResolvedValueOnce({ message: "logged out" });
    setAccessToken("live-token");
    const { queryClient, wrapper } = makeWrapper();

    const { result } = renderHook(() => useLogout(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getAccessToken()).toBeNull();
    expect(queryClient.getQueryData(AUTH_SESSION_QUERY_KEY)).toBeNull();
    expect(mockToastError).not.toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalledWith("Logged out");
  });

  it("still clears the access token and session cache when the logout request fails, and toasts like every other mutation", async () => {
    mockLogout.mockRejectedValueOnce(new Error("logout returned 500"));
    setAccessToken("live-token");
    const { queryClient, wrapper } = makeWrapper();

    const { result } = renderHook(() => useLogout(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(getAccessToken()).toBeNull();
    expect(queryClient.getQueryData(AUTH_SESSION_QUERY_KEY)).toBeNull();
    expect(mockToastError).toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it("updates a live AuthContext observer immediately, without needing a remount", async () => {
    mockLogout.mockResolvedValueOnce({ message: "logged out" });
    setAccessToken("live-token");

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, user);
    queryClient.setQueryData(["recipes", "favourites"], ["r_1"]);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(
      () => ({ auth: useAuth(), logout: useLogout() }),
      { wrapper },
    );
    expect(result.current.auth.isAuthenticated).toBe(true);

    result.current.logout.mutate();

    await waitFor(() =>
      expect(result.current.auth.isAuthenticated).toBe(false),
    );
    expect(result.current.auth.user).toBeNull();
    expect(queryClient.getQueryData(["recipes", "favourites"])).toBeUndefined();
  });
});
