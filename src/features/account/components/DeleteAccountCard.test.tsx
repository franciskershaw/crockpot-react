import { endSession } from "@/features/auth/utils/endSession";
import { ApiError } from "@/lib/http/client";
import { buildUser } from "@/test/authFixtures";
import { CurrentPath } from "@/test/CurrentPath";
import { deferred, renderWithQueryClient } from "@/test/queryClientTestUtils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { deleteAccount } from "../data/api";
import { DeleteAccountCard } from "./DeleteAccountCard";

vi.mock("../data/api", () => ({ deleteAccount: vi.fn() }));
vi.mock("@/features/auth/utils/endSession", () => ({ endSession: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const mockDeleteAccount = vi.mocked(deleteAccount);
const mockEndSession = vi.mocked(endSession);

function setup(user = buildUser()) {
  const { queryClient } = renderWithQueryClient(
    <>
      <DeleteAccountCard user={user} />
      <CurrentPath />
    </>,
    { route: "/account" },
  );
  return { queryClient, events: userEvent.setup() };
}

async function openDialog(events: ReturnType<typeof userEvent.setup>) {
  await events.click(screen.getByRole("button", { name: "Delete account…" }));
  return screen.findByRole("dialog", { name: "Delete your account?" });
}

const confirmButton = () =>
  screen.getByRole("button", { name: "Delete account" });

afterEach(() => {
  vi.clearAllMocks();
});

describe("DeleteAccountCard", () => {
  it("disables deletion up front for an admin", () => {
    setup(buildUser({ role: "ADMIN" }));

    expect(
      screen.getByRole("button", { name: "Delete account…" }),
    ).toBeDisabled();
    expect(
      screen.getByText("Admin accounts can't be deleted here."),
    ).toBeInTheDocument();
  });

  it("lets anyone else open the dialog", async () => {
    const { events } = setup();

    expect(await openDialog(events)).toBeInTheDocument();
    expect(
      screen.queryByText("Admin accounts can't be deleted here."),
    ).not.toBeInTheDocument();
  });

  it("deletes a password account with its password, then signs out to the landing page", async () => {
    mockDeleteAccount.mockResolvedValueOnce(undefined);
    const { queryClient, events } = setup();
    await openDialog(events);

    expect(confirmButton()).toBeDisabled();
    await events.type(screen.getByLabelText("Password"), "mypassword");
    await events.click(confirmButton());

    expect(mockDeleteAccount).toHaveBeenCalledWith({ password: "mypassword" });
    await vi.waitFor(() =>
      expect(screen.getByLabelText("path")).toHaveTextContent(/^\/$/),
    );
    expect(mockEndSession).toHaveBeenCalledWith(queryClient);
    expect(toast.success).toHaveBeenCalledWith("We've deleted your account.");
  });

  it("keeps the dialog open with an inline error on a wrong password", async () => {
    mockDeleteAccount.mockRejectedValueOnce(
      new ApiError(403, "invalid_password"),
    );
    const { events } = setup();
    const dialog = await openDialog(events);

    await events.type(screen.getByLabelText("Password"), "wrongpassword");
    await events.click(confirmButton());

    expect(
      await screen.findByText("That password isn't right."),
    ).toBeInTheDocument();
    expect(dialog).toBeInTheDocument();
    expect(mockEndSession).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("can't be dismissed while the delete is in flight", async () => {
    const pending = deferred<void>();
    mockDeleteAccount.mockReturnValueOnce(pending.promise);
    const { events } = setup();
    await openDialog(events);

    await events.type(screen.getByLabelText("Password"), "mypassword");
    await events.click(confirmButton());
    await events.keyboard("{Escape}");

    expect(
      screen.getByRole("dialog", { name: "Delete your account?" }),
    ).toBeInTheDocument();
    pending.reject(new ApiError(403, "invalid_password"));
    expect(
      await screen.findByText("That password isn't right."),
    ).toBeInTheDocument();
  });

  it("asks a Google account to type its email, matching case-insensitively", async () => {
    mockDeleteAccount.mockResolvedValueOnce(undefined);
    const { events } = setup(
      buildUser({ authProvider: "google", email: "priya@gmail.com" }),
    );
    await openDialog(events);
    const field = screen.getByLabelText("Type your email to confirm");

    await events.type(field, "priya@gmail.co");
    expect(confirmButton()).toBeDisabled();
    await events.clear(field);
    await events.type(field, "  Priya@Gmail.com ");
    expect(confirmButton()).toBeEnabled();
    await events.click(confirmButton());

    expect(mockDeleteAccount).toHaveBeenCalledWith({});
  });
});
