import { setAccessToken } from "@/lib/http/tokenStore";
import { buildUser } from "@/test/authFixtures";
import { fakeResponse } from "@/test/fakeResponse";
import { requestedPaths, serverAnswers } from "@/test/fakeServer";
import { renderWithQueryClient } from "@/test/queryClientTestUtils";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_SESSION_QUERY_KEY } from "../data/queryKeys";
import { ConfirmCodeStep } from "./ConfirmCodeStep";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const email = "jamie@example.com";
const user = buildUser();

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  setAccessToken(null);
});

function renderStep(password?: string) {
  const { queryClient } = renderWithQueryClient(
    <ConfirmCodeStep
      email={email}
      password={password}
      onUseDifferentEmail={vi.fn()}
    />,
    { seed: [[AUTH_SESSION_QUERY_KEY, null]] },
  );
  return {
    queryClient,
    ui: userEvent.setup({ advanceTimers: vi.advanceTimersByTime }),
  };
}

async function enterCode(ui: ReturnType<typeof userEvent.setup>, code: string) {
  await ui.type(screen.getByLabelText("6-digit code"), code);
  await ui.click(screen.getByRole("button", { name: "Confirm" }));
}

const resendLine = () => screen.getByText(/Didn't get it\?/).textContent;

describe("ConfirmCodeStep", () => {
  it("checks the code is six digits before sending it", async () => {
    const fetchSpy = serverAnswers({});
    const { ui } = renderStep("correcthorse");

    await enterCode(ui, "4291");

    expect(
      await screen.findByText("Enter the 6-digit code."),
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows a wrong code under the boxes", async () => {
    const fetchSpy = serverAnswers({
      "/auth/confirm": () =>
        fakeResponse(false, 400, { error: "code_invalid" }),
    });
    const { ui } = renderStep("correcthorse");

    await enterCode(ui, "429114");

    expect(
      await screen.findByText("That code isn't right."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("6-digit code")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(requestedPaths(fetchSpy)).toEqual(["/auth/confirm"]);
  });

  it("confirms and signs straight in with the password it holds", async () => {
    const fetchSpy = serverAnswers({
      "/auth/confirm": () => fakeResponse(true, 200, { message: "ok" }),
      "/auth/login": () =>
        fakeResponse(true, 200, { accessToken: "new-token" }),
      "/me": () => fakeResponse(true, 200, user),
    });
    const { ui, queryClient } = renderStep("correcthorse");

    await enterCode(ui, "429107");

    await waitFor(() =>
      expect(queryClient.getQueryData(AUTH_SESSION_QUERY_KEY)).toEqual(user),
    );
    const [, loginInit] = fetchSpy.mock.calls[1];
    expect(JSON.parse(String(loginInit?.body))).toEqual({
      email,
      password: "correcthorse",
    });
  });

  it("asks for the password when the automatic sign-in fails", async () => {
    serverAnswers({
      "/auth/confirm": () => fakeResponse(true, 200, { message: "ok" }),
      "/auth/login": () =>
        fakeResponse(false, 429, { error: "rate_limit_exceeded" }),
    });
    const { ui } = renderStep("correcthorse");

    await enterCode(ui, "429107");

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Email confirmed. Sign in to carry on.",
    );
    expect(screen.getByLabelText("Email")).toHaveValue(email);
  });

  it("asks for the password when it doesn't hold one", async () => {
    const fetchSpy = serverAnswers({
      "/auth/confirm": () => fakeResponse(true, 200, { message: "ok" }),
    });
    const { ui } = renderStep(undefined);

    await enterCode(ui, "429107");

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Email confirmed. Sign in to carry on.",
    );
    expect(requestedPaths(fetchSpy)).toEqual(["/auth/confirm"]);
  });

  it("holds Resend for a minute after a code is sent", async () => {
    const fetchSpy = serverAnswers({
      "/auth/resend-confirmation": () =>
        fakeResponse(true, 200, { message: "resent" }),
    });
    const { ui } = renderStep("correcthorse");
    expect(resendLine()).toBe("Didn't get it? Resend code in 1:00");

    act(() => vi.advanceTimersByTime(60_000));
    await ui.click(screen.getByRole("button", { name: "Resend code" }));

    await waitFor(() =>
      expect(resendLine()).toBe("Didn't get it? Resend code in 1:00"),
    );
    expect(requestedPaths(fetchSpy)).toEqual(["/auth/resend-confirmation"]);
  });

  it("counts down from the server's wait when Resend is too soon", async () => {
    serverAnswers({
      "/auth/resend-confirmation": () =>
        new Response(
          JSON.stringify({ error: "resend_too_soon", retryAfterSeconds: 30 }),
          { status: 429, headers: { "Retry-After": "30" } },
        ),
    });
    const { ui } = renderStep("correcthorse");

    act(() => vi.advanceTimersByTime(60_000));
    await ui.click(screen.getByRole("button", { name: "Resend code" }));

    await waitFor(() =>
      expect(resendLine()).toBe("Didn't get it? Resend code in 0:30"),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
