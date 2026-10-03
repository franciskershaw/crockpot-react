import { setAccessToken } from "@/lib/http/tokenStore";
import { fakeResponse } from "@/test/fakeResponse";
import { renderWithQueryClient } from "@/test/queryClientTestUtils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ForgotPasswordPage } from "./ForgotPasswordPage";
import { LoginPage } from "./LoginPage";
import { RegisterPage } from "./RegisterPage";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const email = "jamie@example.com";

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  setAccessToken(null);
});

function renderAuthPages(start: string) {
  renderWithQueryClient(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    </Routes>,
    { route: start },
  );
  return userEvent.setup();
}

async function onPage(heading: string) {
  return screen.findByRole("heading", { name: heading });
}

describe("links between the auth pages carry the typed email", () => {
  it("from sign in to the forgot-password form", async () => {
    const ui = renderAuthPages("/login");
    await ui.type(screen.getByLabelText("Email"), email);

    await ui.click(screen.getByRole("link", { name: /Forgot/ }));

    await onPage("Reset your password");
    expect(screen.getByLabelText("Email")).toHaveValue(email);
  });

  it("from sign in to create an account", async () => {
    const ui = renderAuthPages("/login");
    await ui.type(screen.getByLabelText("Email"), email);

    await ui.click(screen.getByRole("link", { name: "Create one" }));

    await onPage("Create your account");
    expect(screen.getByLabelText("Email")).toHaveValue(email);
  });

  it("from create an account to sign in", async () => {
    const ui = renderAuthPages("/register");
    await ui.type(screen.getByLabelText("Email"), email);

    await ui.click(screen.getByRole("link", { name: "Sign in" }));

    await onPage("Sign in");
    expect(screen.getByLabelText("Email")).toHaveValue(email);
  });

  it("from the already-registered banner to sign in", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      fakeResponse(false, 409, { error: "email_already_registered" }),
    );
    const ui = renderAuthPages("/register");
    await ui.type(screen.getByLabelText("Name"), "Jamie Alder");
    await ui.type(screen.getByLabelText("Email"), email);
    await ui.type(screen.getByLabelText("Password"), "correcthorse");
    await ui.type(screen.getByLabelText("Confirm password"), "correcthorse");
    await ui.click(screen.getByRole("button", { name: "Create account" }));

    await ui.click(
      await screen.findByRole("link", { name: "Sign in instead" }),
    );

    await onPage("Sign in");
    expect(screen.getByLabelText("Email")).toHaveValue(email);
  });

  it("from the forgot-password form back to sign in", async () => {
    const ui = renderAuthPages("/forgot-password");
    await ui.type(screen.getByLabelText("Email"), email);

    await ui.click(screen.getByRole("link", { name: "Back to sign in" }));

    await onPage("Sign in");
    expect(screen.getByLabelText("Email")).toHaveValue(email);
  });
});
