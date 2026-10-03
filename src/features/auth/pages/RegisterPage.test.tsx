import { setAccessToken } from "@/lib/http/tokenStore";
import { fakeResponse } from "@/test/fakeResponse";
import { setupQueryClient } from "@/test/queryClientTestUtils";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AUTH_SESSION_QUERY_KEY } from "../data/queryKeys";
import { RegisterPage } from "./RegisterPage";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  setAccessToken(null);
});

function renderRegister() {
  const { wrapper: Wrapper } = setupQueryClient([
    [AUTH_SESSION_QUERY_KEY, null],
  ]);
  render(
    <Wrapper>
      <MemoryRouter initialEntries={["/register"]}>
        <RegisterPage />
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

async function fillAndSubmit({
  name = "Jamie Alder",
  email = "jamie@example.com",
  password = "correcthorse",
  confirmPassword = password,
}: {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
} = {}) {
  const ui = userEvent.setup();
  await ui.type(screen.getByLabelText("Name"), name);
  await ui.type(screen.getByLabelText("Email"), email);
  await ui.type(screen.getByLabelText("Password"), password);
  await ui.type(screen.getByLabelText("Confirm password"), confirmPassword);
  await ui.click(screen.getByRole("button", { name: "Create account" }));
  return ui;
}

describe("RegisterPage", () => {
  it("checks the fields before sending anything", async () => {
    const fetchSpy = serverAnswers({});
    renderRegister();

    await fillAndSubmit({ password: "short", confirmPassword: "shorter" });

    expect(
      await screen.findByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();
    expect(screen.getByText("Passwords don't match.")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("offers sign-in when the email is already registered", async () => {
    serverAnswers({
      "/auth/register": () =>
        fakeResponse(false, 409, { error: "email_already_registered" }),
    });
    renderRegister();

    await fillAndSubmit();

    const banner = await screen.findByRole("alert");
    expect(banner).toHaveTextContent("This email's already registered.");
    expect(
      screen.getByRole("link", { name: "Sign in instead" }),
    ).toHaveAttribute("href", "/login");
  });

  it("sends the details and moves on to the code step", async () => {
    const fetchSpy = serverAnswers({
      "/auth/register": () =>
        fakeResponse(true, 201, { message: "check your email" }),
    });
    renderRegister();

    await fillAndSubmit();

    expect(
      await screen.findByRole("heading", { name: "Check your email" }),
    ).toBeInTheDocument();
    expect(screen.getByText("jamie@example.com")).toBeInTheDocument();
    const [, init] = fetchSpy.mock.calls[0];
    expect(JSON.parse(String(init?.body))).toEqual({
      name: "Jamie Alder",
      email: "jamie@example.com",
      password: "correcthorse",
    });
  });

  it("goes back to the filled-in form to use a different email", async () => {
    serverAnswers({
      "/auth/register": () =>
        fakeResponse(true, 201, { message: "check your email" }),
    });
    renderRegister();
    const ui = await fillAndSubmit();
    await screen.findByRole("heading", { name: "Check your email" });

    await ui.click(
      screen.getByRole("button", { name: "Use a different email" }),
    );

    expect(screen.getByLabelText("Name")).toHaveValue("Jamie Alder");
    expect(screen.getByLabelText("Email")).toHaveValue("jamie@example.com");
  });
});
