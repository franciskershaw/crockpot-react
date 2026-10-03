import { setAccessToken } from "@/lib/http/tokenStore";
import { fakeResponse } from "@/test/fakeResponse";
import { setupQueryClient } from "@/test/queryClientTestUtils";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ForgotPasswordPage } from "./ForgotPasswordPage";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  setAccessToken(null);
});

function renderForgot() {
  const { wrapper: Wrapper } = setupQueryClient();
  render(
    <Wrapper>
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <ForgotPasswordPage />
      </MemoryRouter>
    </Wrapper>,
  );
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

async function requestLink(email: string) {
  const ui = userEvent.setup();
  await ui.type(screen.getByLabelText("Email"), email);
  await ui.click(screen.getByRole("button", { name: "Send reset link" }));
}

describe("ForgotPasswordPage", () => {
  it("checks the email before sending anything", async () => {
    const fetchSpy = serverAnswers({});
    renderForgot();

    await requestLink("jamie");

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("says when no account has that email", async () => {
    serverAnswers({
      "/auth/forgot-password": () =>
        fakeResponse(false, 400, { error: "email_not_found" }),
    });
    renderForgot();

    await requestLink("jamie@typo.com");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't find an account with that email.",
    );
  });

  it("confirms the link is on its way and holds Resend for a minute", async () => {
    const fetchSpy = serverAnswers({
      "/auth/forgot-password": () =>
        fakeResponse(true, 200, { message: "check your email" }),
    });
    renderForgot();

    await requestLink("jamie@example.com");

    expect(
      await screen.findByRole("heading", { name: "Check your email" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/We've sent a reset link to/).textContent).toBe(
      "We've sent a reset link to jamie@example.com. It expires in 1 hour.",
    );
    expect(screen.getByText(/Didn't get it\?/).textContent).toBe(
      "Didn't get it? Resend link in 1:00",
    );
    expect(
      screen.getByRole("link", { name: "Back to sign in" }),
    ).toHaveAttribute("href", "/login");
    const [, init] = fetchSpy.mock.calls[0];
    expect(JSON.parse(String(init?.body))).toEqual({
      email: "jamie@example.com",
    });
  });
});
