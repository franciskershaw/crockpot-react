import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import App from "./App";

// Every request 401s, so `fetchSession` resolves to "logged out" fast and
// without retry backoff. `/` then renders the sign-in placeholder.
beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: false,
    status: 401,
    json: () => Promise.resolve({}),
  } as Response);
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("renders the sign-in placeholder once the session resolves unauthenticated", async () => {
  render(<App />);

  expect(
    await screen.findByRole("button", { name: /continue with google/i }),
  ).toBeInTheDocument();
});
