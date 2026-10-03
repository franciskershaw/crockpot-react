import { setAccessToken } from "@/lib/http/tokenStore";
import { buildUser } from "@/test/authFixtures";
import { fakeResponse } from "@/test/fakeResponse";
import { requestedPaths, serverAnswers } from "@/test/fakeServer";
import { renderWithQueryClient } from "@/test/queryClientTestUtils";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AUTH_SESSION_QUERY_KEY } from "../data/queryKeys";
import { LoginPage } from "./LoginPage";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const user = buildUser();

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  setAccessToken(null);
});

function renderLogin() {
  return renderWithQueryClient(<LoginPage />, {
    route: "/login",
    seed: [[AUTH_SESSION_QUERY_KEY, null]],
  });
}

async function signIn(email: string, password: string) {
  const ui = userEvent.setup();
  if (email) await ui.type(screen.getByLabelText("Email"), email);
  if (password) await ui.type(screen.getByLabelText("Password"), password);
  await ui.click(screen.getByRole("button", { name: "Sign in" }));
}

describe("LoginPage", () => {
  it("checks the fields before sending anything", async () => {
    const fetchSpy = serverAnswers({});
    renderLogin();

    await signIn("jamie", "");

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows a wrong password in the banner, not a toast", async () => {
    const fetchSpy = serverAnswers({
      "/auth/login": () =>
        fakeResponse(false, 401, { error: "invalid_credentials" }),
    });
    renderLogin();

    await signIn("jamie@example.com", "wrong-password");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Incorrect email or password.",
    );
    expect(toast.error).not.toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("offers Google sign-in from the banner for a Google account", async () => {
    serverAnswers({
      "/auth/login": () =>
        fakeResponse(false, 401, { error: "google_account_no_password" }),
    });
    renderLogin();

    await signIn("jamie@example.com", "anything-at-all");

    const banner = await screen.findByRole("alert");
    expect(banner).toHaveTextContent("This email signs in with Google.");
    expect(
      within(banner).getByRole("button", { name: "Continue with Google" }),
    ).toBeInTheDocument();
  });

  it("sends an unconfirmed account to the code step with a fresh code", async () => {
    const fetchSpy = serverAnswers({
      "/auth/login": () =>
        fakeResponse(false, 403, { error: "email_not_confirmed" }),
      "/auth/resend-confirmation": () =>
        fakeResponse(true, 200, { message: "resent" }),
    });
    renderLogin();

    await signIn("jamie@example.com", "correcthorse");

    expect(
      await screen.findByRole("heading", { name: "Check your email" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Didn't get it\?/).textContent).toBe(
      "Didn't get it? Resend code in 1:00",
    );
    expect(requestedPaths(fetchSpy)).toEqual([
      "/auth/login",
      "/auth/resend-confirmation",
    ]);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("treats a too-soon automatic resend as a code already on its way", async () => {
    serverAnswers({
      "/auth/login": () =>
        fakeResponse(false, 403, { error: "email_not_confirmed" }),
      "/auth/resend-confirmation": () =>
        new Response(
          JSON.stringify({ error: "resend_too_soon", retryAfterSeconds: 30 }),
          { status: 429, headers: { "Retry-After": "30" } },
        ),
    });
    renderLogin();

    await signIn("jamie@example.com", "correcthorse");

    await screen.findByRole("heading", { name: "Check your email" });
    expect(screen.getByText(/Didn't get it\?/).textContent).toBe(
      "Didn't get it? Resend code in 0:30",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("goes back to sign in, email kept, to use a different email", async () => {
    serverAnswers({
      "/auth/login": () =>
        fakeResponse(false, 403, { error: "email_not_confirmed" }),
      "/auth/resend-confirmation": () =>
        fakeResponse(true, 200, { message: "resent" }),
    });
    renderLogin();
    await signIn("jamie@example.com", "correcthorse");
    await screen.findByRole("heading", { name: "Check your email" });

    await userEvent.click(
      screen.getByRole("button", { name: "Use a different email" }),
    );

    expect(
      screen.getByRole("heading", { name: "Sign in" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveValue("jamie@example.com");
  });

  it("returns to the sign-in form from the code step's already-confirmed banner", async () => {
    serverAnswers({
      "/auth/login": () =>
        fakeResponse(false, 403, { error: "email_not_confirmed" }),
      "/auth/resend-confirmation": () =>
        fakeResponse(true, 200, { message: "resent" }),
      "/auth/confirm": () =>
        fakeResponse(false, 400, { error: "already_confirmed" }),
    });
    renderLogin();
    await signIn("jamie@example.com", "correcthorse");
    await screen.findByRole("heading", { name: "Check your email" });
    const ui = userEvent.setup();
    await ui.type(screen.getByLabelText("6-digit code"), "429107");
    await ui.click(screen.getByRole("button", { name: "Confirm" }));

    await ui.click(await screen.findByRole("link", { name: "Sign in" }));

    expect(
      await screen.findByRole("heading", { name: "Sign in" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveValue("jamie@example.com");
  });

  it("signs the user in", async () => {
    serverAnswers({
      "/auth/login": () =>
        fakeResponse(true, 200, { accessToken: "new-token" }),
      "/me": () => fakeResponse(true, 200, user),
    });
    const { queryClient } = renderLogin();

    await signIn("jamie@example.com", "correcthorse");

    await waitFor(() =>
      expect(queryClient.getQueryData(AUTH_SESSION_QUERY_KEY)).toEqual(user),
    );
  });
});
