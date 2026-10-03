import { getAccessToken, setAccessToken } from "@/lib/http/tokenStore";
import { fakeResponse } from "@/test/fakeResponse";
import { setupQueryClient } from "@/test/queryClientTestUtils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AUTH_SESSION_QUERY_KEY } from "../data/queryKeys";
import type { User } from "../data/types";
import { startSession } from "./startSession";

const user: User = {
  id: "u_1",
  email: "jamie@example.com",
  name: "Jamie Alder",
  image: null,
  role: "FREE",
};

const RECIPES_KEY = ["recipes", "list", ""];

afterEach(() => {
  vi.restoreAllMocks();
  setAccessToken(null);
});

function meAnswers(response: Response) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(response);
}

describe("startSession", () => {
  it("fetches the user with the new token and signs them in", async () => {
    const fetchSpy = meAnswers(fakeResponse(true, 200, user));
    const { queryClient } = setupQueryClient([[AUTH_SESSION_QUERY_KEY, null]]);

    await startSession(queryClient, "new-token");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url).endsWith("/me")).toBe(true);
    expect(new Headers(init?.headers).get("Authorization")).toBe(
      "Bearer new-token",
    );
    expect(getAccessToken()).toBe("new-token");
    expect(queryClient.getQueryData(AUTH_SESSION_QUERY_KEY)).toEqual(user);
  });

  it("drops data cached while signed out, before writing the session", async () => {
    meAnswers(fakeResponse(true, 200, user));
    const { queryClient } = setupQueryClient([
      [AUTH_SESSION_QUERY_KEY, null],
      [RECIPES_KEY, { recipes: [{ id: "r_1", isFavourite: false }] }],
    ]);
    const events: string[] = [];
    queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "removed" || event.type === "updated") {
        events.push(`${event.type} ${String(event.query.queryKey[0])}`);
      }
    });

    await startSession(queryClient, "new-token");

    expect(queryClient.getQueryData(RECIPES_KEY)).toBeUndefined();
    expect(events.indexOf("removed recipes")).toBeGreaterThan(-1);
    expect(events.indexOf("removed recipes")).toBeLessThan(
      events.indexOf("updated auth"),
    );
  });

  it("clears the token and leaves the cache alone when the user can't be fetched", async () => {
    meAnswers(fakeResponse(false, 500, { error: "server_error" }));
    const { queryClient } = setupQueryClient([
      [AUTH_SESSION_QUERY_KEY, null],
      [RECIPES_KEY, { recipes: [] }],
    ]);

    await expect(startSession(queryClient, "new-token")).rejects.toMatchObject({
      status: 500,
    });

    expect(getAccessToken()).toBeNull();
    expect(queryClient.getQueryData(AUTH_SESSION_QUERY_KEY)).toBeNull();
    expect(queryClient.getQueryData(RECIPES_KEY)).toEqual({ recipes: [] });
  });
});
