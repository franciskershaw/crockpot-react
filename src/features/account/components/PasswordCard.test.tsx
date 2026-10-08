import { startSession } from "@/features/auth/utils/startSession";
import { ApiError } from "@/lib/http/client";
import { buildUser } from "@/test/authFixtures";
import { deferred, renderWithQueryClient } from "@/test/queryClientTestUtils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { changePassword } from "../data/api";
import { PasswordCard } from "./PasswordCard";

vi.mock("../data/api", () => ({ changePassword: vi.fn() }));
vi.mock("@/features/auth/utils/startSession", () => ({
  startSession: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const mockChangePassword = vi.mocked(changePassword);
const mockStartSession = vi.mocked(startSession);

function setup(user = buildUser()) {
  const { queryClient } = renderWithQueryClient(<PasswordCard user={user} />);
  return { queryClient, events: userEvent.setup() };
}

async function submit(
  events: ReturnType<typeof userEvent.setup>,
  current: string,
  next: string,
) {
  if (current)
    await events.type(screen.getByLabelText("Current password"), current);
  if (next) await events.type(screen.getByLabelText("New password"), next);
  await events.click(screen.getByRole("button", { name: "Change password" }));
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("PasswordCard", () => {
  it("changes the password, keeps the session with the new token, and clears the fields", async () => {
    mockChangePassword.mockResolvedValueOnce({ accessToken: "fresh-token" });
    const { queryClient, events } = setup();

    await submit(events, "oldpassword", "newpassword");

    expect(mockChangePassword).toHaveBeenCalledWith({
      currentPassword: "oldpassword",
      newPassword: "newpassword",
    });
    await vi.waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Password changed"),
    );
    expect(mockStartSession).toHaveBeenCalledWith(queryClient, "fresh-token");
    expect(screen.getByLabelText("Current password")).toHaveValue("");
    expect(screen.getByLabelText("New password")).toHaveValue("");
  });

  it("changes the password again after a first change", async () => {
    mockChangePassword.mockResolvedValue({ accessToken: "fresh-token" });
    const { events } = setup();

    await submit(events, "oldpassword", "newpassword");
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
    await vi.waitFor(() =>
      expect(screen.getByLabelText("New password")).toHaveValue(""),
    );
    await submit(events, "newpassword", "thirdpassword");

    await vi.waitFor(() => expect(mockChangePassword).toHaveBeenCalledTimes(2));
    expect(mockChangePassword).toHaveBeenLastCalledWith({
      currentPassword: "newpassword",
      newPassword: "thirdpassword",
    });
  });

  it("asks for the current password before sending", async () => {
    const { events } = setup();

    await submit(events, "", "newpassword");

    expect(
      await screen.findByText("Enter your current password."),
    ).toBeInTheDocument();
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it("rejects a short new password before sending", async () => {
    const { events } = setup();

    await submit(events, "oldpassword", "short");

    expect(
      await screen.findByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it("shows a wrong current password inline and keeps the session", async () => {
    mockChangePassword.mockRejectedValueOnce(
      new ApiError(403, "invalid_password"),
    );
    const { events } = setup();

    await submit(events, "wrongpassword", "newpassword");

    expect(
      await screen.findByText("That password isn't right."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Current password")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(mockStartSession).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("shows the server's new-password rule on New password", async () => {
    mockChangePassword.mockRejectedValueOnce(
      new ApiError(400, "password_too_long"),
    );
    const { events } = setup();

    await submit(events, "oldpassword", "newpassword");

    expect(
      await screen.findByText("Password must be 72 bytes or fewer."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("New password")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("disables the button, keeping its label, while the change is in flight", async () => {
    const pending = deferred<{ accessToken: string }>();
    mockChangePassword.mockReturnValueOnce(pending.promise);
    const { events } = setup();

    await submit(events, "oldpassword", "newpassword");

    await vi.waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Change password" }),
      ).toBeDisabled(),
    );
    pending.resolve({ accessToken: "fresh-token" });
    await vi.waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Change password" }),
      ).toBeEnabled(),
    );
  });

  it("explains there's no password for a Google account", () => {
    setup(buildUser({ authProvider: "google" }));

    expect(
      screen.getByText(
        "You sign in with Google, so there's no password to change here.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Current password")).not.toBeInTheDocument();
  });
});
