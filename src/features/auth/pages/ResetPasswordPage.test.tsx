import { setAccessToken } from "@/lib/http/tokenStore";
import { fakeResponse } from "@/test/fakeResponse";
import { setupQueryClient } from "@/test/queryClientTestUtils";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AUTH_SESSION_QUERY_KEY } from "../data/queryKeys";
import type { User } from "../data/types";
import { ResetPasswordPage } from "./ResetPasswordPage";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const user: User = {
  id: "u_1",
  email: "jamie@example.com",
  name: "Jamie Alder",
  image: null,
  role: "FREE",
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  setAccessToken(null);
});

function renderReset(route = "/reset-password?token=reset-token") {
  const { queryClient, wrapper: Wrapper } = setupQueryClient([
    [AUTH_SESSION_QUERY_KEY, null],
  ]);
  render(
    <Wrapper>
      <MemoryRouter initialEntries={[route]}>
        <ResetPasswordPage />
      </MemoryRouter>
    </Wrapper>,
  );
  return { queryClient };
}

function serverAnswers(answers: Record<string, () => Response>) {
  return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const path = new URL(String(input)).pathname;
    const answer = answers[path];
    return answer
      ? Promise.resolve(answer())
      : Promise.reject(new Error(`unexpected request to ${path}`));
  });
}

async function setPassword(password: string, confirmPassword = password) {
  const ui = userEvent.setup();
  await ui.type(screen.getByLabelText("New password"), password);
  await ui.type(screen.getByLabelText("Confirm new password"), confirmPassword);
  await ui.click(screen.getByRole("button", { name: "Reset password" }));
}

function expectInvalidLink() {
  expect(
    screen.getByRole("heading", { name: "This link isn't valid" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Request a new link" }),
  ).toHaveAttribute("href", "/forgot-password");
  expect(screen.queryByLabelText("New password")).not.toBeInTheDocument();
}

describe("ResetPasswordPage", () => {
  it("shows the invalid-link state when the link has no token", () => {
    renderReset("/reset-password");

    expectInvalidLink();
  });

  it("checks the passwords before sending anything", async () => {
    const fetchSpy = serverAnswers({});
    renderReset();

    await setPassword("short", "different");

    expect(
      await screen.findByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();
    expect(screen.getByText("Passwords don't match.")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("switches to the invalid-link state when the token turns out to be dead", async () => {
    serverAnswers({
      "/auth/reset-password": () =>
        fakeResponse(false, 400, { error: "token_expired" }),
    });
    renderReset();

    await setPassword("newhorse1");

    await screen.findByRole("heading", { name: "This link isn't valid" });
    expectInvalidLink();
  });

  it("sets the password, signs the user in and says other devices are signed out", async () => {
    const fetchSpy = serverAnswers({
      "/auth/reset-password": () =>
        fakeResponse(true, 200, { accessToken: "new-token" }),
      "/me": () => fakeResponse(true, 200, user),
    });
    const { queryClient } = renderReset();

    await setPassword("newhorse1");

    await waitFor(() =>
      expect(queryClient.getQueryData(AUTH_SESSION_QUERY_KEY)).toEqual(user),
    );
    const [, init] = fetchSpy.mock.calls[0];
    expect(JSON.parse(String(init?.body))).toEqual({
      token: "reset-token",
      newPassword: "newhorse1",
    });
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Password updated. You've been signed out on other devices.",
      ),
    );
  });
});
