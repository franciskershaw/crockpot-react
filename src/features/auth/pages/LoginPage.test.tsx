import { setAccessToken } from "@/lib/http/tokenStore";
import { fakeResponse } from "@/test/fakeResponse";
import { setupQueryClient } from "@/test/queryClientTestUtils";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AUTH_SESSION_QUERY_KEY } from "../data/queryKeys";
import type { User } from "../data/types";
import { LoginPage } from "./LoginPage";

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

function renderLogin() {
  const { queryClient, wrapper: Wrapper } = setupQueryClient([
    [AUTH_SESSION_QUERY_KEY, null],
  ]);
  render(
    <Wrapper>
      <MemoryRouter initialEntries={["/login"]}>
        <LoginPage />
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
