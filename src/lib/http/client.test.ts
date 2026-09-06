import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiErrorMessage, apiFetch } from "./client";
import { setAccessToken } from "./tokenStore";

function mockFetchOnce(status: number, jsonImpl: () => Promise<unknown>) {
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
    ok: false,
    status,
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
});

describe("apiFetch 401 refresh/retry", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setAccessToken(null);
  });

  function respond(ok: boolean, status: number, body: unknown = {}) {
    return { ok, status, json: () => Promise.resolve(body) } as Response;
  }

  it("collapses concurrent 401s from separate in-flight requests into one refresh call", async () => {
    let refreshCalls = 0;
    const attemptsByUrl: Record<string, number> = {};

    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url.endsWith("/auth/refresh")) {
        refreshCalls++;
        return Promise.resolve(
          respond(true, 200, { accessToken: "refreshed-token" }),
        );
      }
      attemptsByUrl[url] = (attemptsByUrl[url] ?? 0) + 1;
      const isFirstAttempt = attemptsByUrl[url] === 1;
      return Promise.resolve(
        respond(!isFirstAttempt, isFirstAttempt ? 401 : 200),
      );
    });

    await expect(
      Promise.all([apiFetch("/a"), apiFetch("/b")]),
    ).resolves.toEqual([{}, {}]);

    expect(refreshCalls).toBe(1);
  });

  it("retries a 401 exactly once, then surfaces the second failure instead of looping", async () => {
    let dataCalls = 0;

    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url.endsWith("/auth/refresh")) {
        return Promise.resolve(
          respond(true, 200, { accessToken: "refreshed-token" }),
        );
      }
      dataCalls++;
      return Promise.resolve(respond(false, 401));
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
        return Promise.resolve(respond(false, 401));
      }
      dataCalls++;
      return Promise.resolve(respond(false, 401));
    });

    await expect(apiFetch("/whatever")).rejects.toMatchObject({
      status: 401,
      message: "failed to refresh session",
    } satisfies Partial<ApiError>);
    expect(dataCalls).toBe(1);
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
