import { getAccessToken, setAccessToken } from "@/lib/http/tokenStore";
import { setupQueryClient } from "@/test/queryClientTestUtils";
import { afterEach, describe, expect, it } from "vitest";

import { AUTH_SESSION_QUERY_KEY } from "../data/queryKeys";
import type { User } from "../data/types";
import { endSession } from "./endSession";

const user: User = {
  id: "u_1",
  email: "founder@example.com",
  name: "Founder",
  image: null,
  role: "FREE",
};

const MENU_KEY = ["menu"];

afterEach(() => {
  setAccessToken(null);
});

describe("endSession", () => {
  it("signs the user out and wipes every other cache", () => {
    setAccessToken("live-token");
    const { queryClient } = setupQueryClient([
      [AUTH_SESSION_QUERY_KEY, user],
      [MENU_KEY, { entries: [] }],
    ]);

    expect(endSession(queryClient)).toBe(true);

    expect(queryClient.getQueryData(AUTH_SESSION_QUERY_KEY)).toBeNull();
    expect(queryClient.getQueryData(MENU_KEY)).toBeUndefined();
    expect(getAccessToken()).toBeNull();
  });

  it("does nothing when the session has already ended", () => {
    const { queryClient } = setupQueryClient([
      [AUTH_SESSION_QUERY_KEY, null],
      [MENU_KEY, { entries: [] }],
    ]);

    expect(endSession(queryClient)).toBe(false);

    expect(queryClient.getQueryData(MENU_KEY)).toEqual({ entries: [] });
  });

  it("does nothing before the session has loaded", () => {
    const { queryClient } = setupQueryClient([[MENU_KEY, { entries: [] }]]);

    expect(endSession(queryClient)).toBe(false);

    expect(queryClient.getQueryData(AUTH_SESSION_QUERY_KEY)).toBeUndefined();
    expect(queryClient.getQueryData(MENU_KEY)).toEqual({ entries: [] });
  });
});
