import { type ReactNode } from "react";
import { getAccessToken, setAccessToken } from "@/lib/http/tokenStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { logout } from "./api";
import { AUTH_SESSION_QUERY_KEY } from "./AuthContext";
import type { User } from "./types";
import { useLogout } from "./useLogout";

vi.mock("./api", () => ({
  fetchMe: vi.fn(),
  logout: vi.fn(),
}));

const mockLogout = vi.mocked(logout);

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
  });

  it("still clears the access token and session cache when the logout request fails", async () => {
    mockLogout.mockRejectedValueOnce(new Error("logout returned 500"));
    setAccessToken("live-token");
    const { queryClient, wrapper } = makeWrapper();

    const { result } = renderHook(() => useLogout(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(getAccessToken()).toBeNull();
    expect(queryClient.getQueryData(AUTH_SESSION_QUERY_KEY)).toBeNull();
  });
});
