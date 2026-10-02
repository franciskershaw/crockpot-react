import { getAccessToken, setAccessToken } from "./tokenStore";

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) throw new Error("VITE_API_URL is not set");

export class ApiError extends Error {
  status: number;
  retryAfterSeconds?: number;

  constructor(status: number, message: string, retryAfterSeconds?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

// The refresh was rejected: this session is over and won't come back by retrying.
export class SessionExpiredError extends ApiError {
  constructor() {
    super(401, "session expired");
    this.name = "SessionExpiredError";
  }
}

const sessionExpiredListeners = new Set<() => void>();

export function onSessionExpired(listener: () => void): () => void {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
}

function retryAfterSeconds(res: Response): number | undefined {
  const seconds = Number.parseInt(res.headers.get("Retry-After") ?? "", 10);
  return Number.isNaN(seconds) ? undefined : seconds;
}

export function apiErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "request failed";
}

let refreshPromise: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  // Only a 401 means the session is gone; a 429, 5xx or dropped connection keeps it.
  if (res.status === 401) {
    setAccessToken(null);
    for (const listener of sessionExpiredListeners) listener();
    throw new SessionExpiredError();
  }
  if (!res.ok) {
    throw new ApiError(res.status, "failed to refresh session");
  }
  const data = (await res.json()) as { accessToken: string };
  setAccessToken(data.accessToken);
  return data.accessToken;
}

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  hasRetried = false,
): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (res.status === 401 && !hasRetried) {
    await refreshAccessToken();
    return apiFetch<T>(path, options, true);
  }

  if (!res.ok) {
    let message = "request failed";
    try {
      const body = await res.json();
      if (typeof body?.error === "string") {
        message = body.error;
      }
    } catch {
      // non-JSON body — keep the generic fallback
    }
    throw new ApiError(res.status, message, retryAfterSeconds(res));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
