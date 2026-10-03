import { fakeResponse } from "@/test/fakeResponse";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ApiError,
  apiErrorMessage,
  apiFetch,
  onSessionExpired,
  SessionExpiredError,
} from "./client";
import { getAccessToken, setAccessToken } from "./tokenStore";

function mockFetchOnce(
  status: number,
  jsonImpl: () => Promise<unknown>,
  headers: HeadersInit = {},
) {
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
    ok: false,
    status,
    headers: new Headers(headers),
    json: jsonImpl,
  } as Response);
}

describe("apiFetch 204 handling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns undefined for a 204 No Content response without parsing a body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: () =>
        Promise.reject(new SyntaxError("Unexpected end of JSON input")),
    } as Response);

    await expect(
      apiFetch("/categories/1", { method: "DELETE" }),
    ).resolves.toBeUndefined();
  });
});

describe("apiFetch error parsing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the .error field from a JSON error body", async () => {
    mockFetchOnce(409, () =>
      Promise.resolve({ error: "a category with this name already exists" }),
    );

    await expect(
      apiFetch("/categories", { method: "POST" }),
    ).rejects.toMatchObject({
      message: "a category with this name already exists",
      status: 409,
    } satisfies Partial<ApiError>);
  });

  it("falls back to a generic message when the body isn't valid JSON", async () => {
    mockFetchOnce(500, () =>
      Promise.reject(new SyntaxError("Unexpected token")),
    );

    await expect(apiFetch("/categories")).rejects.toMatchObject({
      message: "request failed",
      status: 500,
    } satisfies Partial<ApiError>);
  });

  it("falls back to a generic message when the JSON body has no .error field", async () => {
    mockFetchOnce(400, () => Promise.resolve({ somethingElse: true }));

    await expect(apiFetch("/categories")).rejects.toMatchObject({
      message: "request failed",
      status: 400,
    } satisfies Partial<ApiError>);
  });

  it("carries a 429's Retry-After seconds", async () => {
    mockFetchOnce(
      429,
      () => Promise.resolve({ error: "rate_limit_exceeded" }),
      { "Retry-After": "600" },
    );

    await expect(
      apiFetch("/recipes", { method: "POST" }),
    ).rejects.toMatchObject({
      status: 429,
      retryAfterSeconds: 600,
    } satisfies Partial<ApiError>);
  });

  it("leaves Retry-After unset when the header can't be read", async () => {
    mockFetchOnce(429, () => Promise.resolve({ error: "rate_limit_exceeded" }));

    const error = await apiFetch("/recipes").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).retryAfterSeconds).toBeUndefined();
  });
});

describe("apiFetch 401 refresh/retry", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setAccessToken(null);
  });

  it("collapses concurrent 401s from separate in-flight requests into one refresh call", async () => {
    let refreshCalls = 0;
    const attemptsByUrl: Record<string, number> = {};

    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url.endsWith("/auth/refresh")) {
        refreshCalls++;
        return Promise.resolve(
          fakeResponse(true, 200, { accessToken: "refreshed-token" }),
        );
      }
      attemptsByUrl[url] = (attemptsByUrl[url] ?? 0) + 1;
      const isFirstAttempt = attemptsByUrl[url] === 1;
      return Promise.resolve(
        fakeResponse(!isFirstAttempt, isFirstAttempt ? 401 : 200),
      );
    });

    await expect(
      Promise.all([apiFetch("/a"), apiFetch("/b")]),
    ).resolves.toEqual([{}, {}]);

    expect(refreshCalls).toBe(1);
  });

  it("resends a multipart body after refreshing", async () => {
    const body = new FormData();
    body.set("recipe", "{}");
    const sentBodies: unknown[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      if (String(input).endsWith("/auth/refresh")) {
        return Promise.resolve(
          fakeResponse(true, 200, { accessToken: "fresh" }),
        );
      }
      sentBodies.push(init?.body);
      return Promise.resolve(
        sentBodies.length === 1
          ? fakeResponse(false, 401)
          : fakeResponse(true, 200),
      );
    });

    await apiFetch("/recipes", { method: "POST", body });

    expect(sentBodies).toEqual([body, body]);
  });

  it("retries a 401 exactly once, then surfaces the second failure instead of looping", async () => {
    let dataCalls = 0;

    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url.endsWith("/auth/refresh")) {
        return Promise.resolve(
          fakeResponse(true, 200, { accessToken: "refreshed-token" }),
        );
      }
      dataCalls++;
      return Promise.resolve(fakeResponse(false, 401));
    });

    await expect(apiFetch("/still-unauthorized")).rejects.toMatchObject({
      status: 401,
    } satisfies Partial<ApiError>);
    expect(dataCalls).toBe(2);
  });

  it("propagates performRefresh's own failure instead of retrying the original request", async () => {
    let dataCalls = 0;

    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url.endsWith("/auth/refresh")) {
        return Promise.resolve(fakeResponse(false, 401));
      }
      dataCalls++;
      return Promise.resolve(fakeResponse(false, 401));
    });

    await expect(apiFetch("/whatever")).rejects.toMatchObject({
      status: 401,
    } satisfies Partial<ApiError>);
    expect(dataCalls).toBe(1);
  });
});

describe("apiFetch with refreshOn401 off", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("surfaces a 401 as its own error without refreshing or ending a session", async () => {
    const listener = vi.fn();
    const stopListening = onSessionExpired(listener);
    let refreshCalls = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      if (String(input).endsWith("/auth/refresh")) {
        refreshCalls++;
        return Promise.resolve(fakeResponse(false, 401));
      }
      return Promise.resolve(
        fakeResponse(false, 401, { error: "invalid_credentials" }),
      );
    });

    const error = await apiFetch(
      "/auth/login",
      { method: "POST" },
      { refreshOn401: false },
    ).catch((e: unknown) => e);
    stopListening();

    expect(error).not.toBeInstanceOf(SessionExpiredError);
    expect(error).toMatchObject({
      status: 401,
      message: "invalid_credentials",
    } satisfies Partial<ApiError>);
    expect(refreshCalls).toBe(0);
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("session expiry", () => {
  let stopListening = () => {};

  afterEach(() => {
    stopListening();
    vi.restoreAllMocks();
    setAccessToken(null);
  });

  function listen() {
    const listener = vi.fn();
    stopListening = onSessionExpired(listener);
    return listener;
  }

  function refreshAnswers(answer: () => Promise<Response>) {
    let refreshCalls = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      if (String(input).endsWith("/auth/refresh")) {
        refreshCalls++;
        return answer();
      }
      return Promise.resolve(fakeResponse(false, 401));
    });
    return () => refreshCalls;
  }

  it("ends the session when the refresh is rejected with 401", async () => {
    setAccessToken("expired-token");
    const listener = listen();
    refreshAnswers(() => Promise.resolve(fakeResponse(false, 401)));

    const error = await apiFetch("/menu").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(SessionExpiredError);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
  });

  it("ends the session once when concurrent requests share the rejected refresh", async () => {
    setAccessToken("expired-token");
    const listener = listen();
    const refreshCalls = refreshAnswers(() =>
      Promise.resolve(fakeResponse(false, 401)),
    );

    const results = await Promise.allSettled([
      apiFetch("/menu"),
      apiFetch("/shopping-list"),
      apiFetch("/recipes/favourites"),
    ]);

    expect(refreshCalls()).toBe(1);
    expect(listener).toHaveBeenCalledTimes(1);
    for (const result of results) {
      expect(result.status).toBe("rejected");
      expect((result as PromiseRejectedResult).reason).toBeInstanceOf(
        SessionExpiredError,
      );
    }
  });

  it.each([429, 500])(
    "keeps the session when the refresh fails with %i",
    async (status) => {
      setAccessToken("still-valid-token");
      const listener = listen();
      refreshAnswers(() => Promise.resolve(fakeResponse(false, status)));

      const error = await apiFetch("/menu").catch((e: unknown) => e);

      expect(error).not.toBeInstanceOf(SessionExpiredError);
      expect((error as ApiError).status).toBe(status);
      expect(listener).not.toHaveBeenCalled();
      expect(getAccessToken()).toBe("still-valid-token");
    },
  );

  it("keeps the session when the refresh can't reach the server", async () => {
    setAccessToken("still-valid-token");
    const listener = listen();
    refreshAnswers(() => Promise.reject(new TypeError("Failed to fetch")));

    const error = await apiFetch("/menu").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(TypeError);
    expect(listener).not.toHaveBeenCalled();
    expect(getAccessToken()).toBe("still-valid-token");
  });

  it("doesn't treat a 401 after a successful refresh as an expired session", async () => {
    const listener = listen();
    refreshAnswers(() =>
      Promise.resolve(fakeResponse(true, 200, { accessToken: "fresh-token" })),
    );

    const error = await apiFetch("/menu").catch((e: unknown) => e);

    expect(error).not.toBeInstanceOf(SessionExpiredError);
    expect((error as ApiError).status).toBe(401);
    expect(listener).not.toHaveBeenCalled();
  });

  it("stops calling a listener once it unsubscribes", async () => {
    const listener = listen();
    stopListening();
    refreshAnswers(() => Promise.resolve(fakeResponse(false, 401)));

    await apiFetch("/menu").catch(() => {});

    expect(listener).not.toHaveBeenCalled();
  });
});

describe("apiErrorMessage", () => {
  it("uses the ApiError's own message", () => {
    expect(apiErrorMessage(new ApiError(404, "recipe not found"))).toBe(
      "recipe not found",
    );
  });

  it("falls back to a generic message for a non-ApiError", () => {
    expect(apiErrorMessage(new TypeError("failed to fetch"))).toBe(
      "request failed",
    );
    expect(apiErrorMessage("not even an Error")).toBe("request failed");
  });
});
