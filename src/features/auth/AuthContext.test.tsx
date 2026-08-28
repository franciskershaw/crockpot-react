import { ApiError, refreshAccessToken } from "@/lib/http/client";
import { getAccessToken, setAccessToken } from "@/lib/http/tokenStore";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchMe } from "./api";
// `fetchSession` is module-private in the packing-list reference; the
// crockpot port must `export` it as the seam these tests drive.
import { fetchSession } from "./AuthContext";
import type { User } from "./types";

vi.mock("@/lib/http/client", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/http/client")>();
  return { ...actual, refreshAccessToken: vi.fn() };
});

vi.mock("./api", () => ({
  fetchMe: vi.fn(),
  logout: vi.fn(),
}));

const mockRefresh = vi.mocked(refreshAccessToken);
const mockFetchMe = vi.mocked(fetchMe);

const user: User = {
  id: "u_1",
  email: "founder@example.com",
  name: "Founder",
  image: null,
  role: "FREE",
};

beforeEach(() => {
  setAccessToken("stale-token");
});

afterEach(() => {
  vi.clearAllMocks();
  setAccessToken(null);
});

describe("fetchSession", () => {
  it("returns null and clears the access token when /auth/refresh 401s", async () => {
    mockRefresh.mockRejectedValueOnce(
      new ApiError(401, "failed to refresh session"),
    );

    await expect(fetchSession()).resolves.toBeNull();
    expect(getAccessToken()).toBeNull();
    expect(mockFetchMe).not.toHaveBeenCalled();
  });

  it("rethrows when /auth/refresh fails with a non-401 status", async () => {
    mockRefresh.mockRejectedValueOnce(new ApiError(500, "server error"));

    await expect(fetchSession()).rejects.toMatchObject({ status: 500 });
  });

  it("returns the user when /auth/refresh and /me both succeed", async () => {
    mockRefresh.mockResolvedValueOnce("fresh-token");
    mockFetchMe.mockResolvedValueOnce(user);

    await expect(fetchSession()).resolves.toEqual(user);
  });

  it("returns null and clears the access token when /me 401s", async () => {
    mockRefresh.mockResolvedValueOnce("fresh-token");
    mockFetchMe.mockRejectedValueOnce(new ApiError(401, "unauthorized"));

    await expect(fetchSession()).resolves.toBeNull();
    expect(getAccessToken()).toBeNull();
  });
});
