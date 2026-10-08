import { AUTH_SESSION_QUERY_KEY } from "@/features/auth/data/queryKeys";
import type { User } from "@/features/auth/data/types";
import { ApiError } from "@/lib/http/client";
import { buildUser } from "@/test/authFixtures";
import { deferred, renderWithQueryClient } from "@/test/queryClientTestUtils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { updateName } from "../data/api";
import { ProfileCard } from "./ProfileCard";

vi.mock("../data/api", () => ({ updateName: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const mockUpdateName = vi.mocked(updateName);
const RULE = "Enter a name between 1 and 50 characters.";

function setup(user: User = buildUser()) {
  const { queryClient } = renderWithQueryClient(<ProfileCard user={user} />, {
    seed: [[AUTH_SESSION_QUERY_KEY, user]],
  });
  return { queryClient, events: userEvent.setup() };
}

async function saveName(
  events: ReturnType<typeof userEvent.setup>,
  name: string,
) {
  const input = screen.getByLabelText("Name");
  await events.clear(input);
  if (name) await events.type(input, name);
  await events.click(screen.getByRole("button", { name: "Save" }));
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("ProfileCard", () => {
  it("saves the trimmed name and updates the signed-in user", async () => {
    const renamed = buildUser({ name: "Sam Lee" });
    mockUpdateName.mockResolvedValueOnce(renamed);
    const { queryClient, events } = setup();

    await saveName(events, "  Sam Lee  ");

    expect(mockUpdateName).toHaveBeenCalledWith("Sam Lee");
    await vi.waitFor(() =>
      expect(queryClient.getQueryData(AUTH_SESSION_QUERY_KEY)).toEqual(renamed),
    );
    expect(toast.success).toHaveBeenCalledWith("Name updated");
  });

  it("saves again after a first save", async () => {
    mockUpdateName
      .mockResolvedValueOnce(buildUser({ name: "Sam Lee" }))
      .mockResolvedValueOnce(buildUser({ name: "Sam Two" }));
    const { events } = setup();

    await saveName(events, "Sam Lee");
    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
    await saveName(events, "Sam Two");

    await vi.waitFor(() => expect(mockUpdateName).toHaveBeenCalledTimes(2));
    expect(mockUpdateName).toHaveBeenLastCalledWith("Sam Two");
  });

  it("rejects an empty name without sending it", async () => {
    const { events } = setup();

    await saveName(events, "");

    expect(await screen.findByText(RULE)).toBeInTheDocument();
    expect(mockUpdateName).not.toHaveBeenCalled();
  });

  it("shows the server's invalid_name inline instead of a toast", async () => {
    mockUpdateName.mockRejectedValueOnce(new ApiError(400, "invalid_name"));
    const { events } = setup();

    await saveName(events, "Sam");

    expect(await screen.findByText(RULE)).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("disables Save, keeping its label, while the name is saving", async () => {
    const pending = deferred<User>();
    mockUpdateName.mockReturnValueOnce(pending.promise);
    const { events } = setup();

    await saveName(events, "Sam");

    await vi.waitFor(() =>
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled(),
    );
    pending.resolve(buildUser({ name: "Sam" }));
    await vi.waitFor(() =>
      expect(screen.getByRole("button", { name: "Save" })).toBeEnabled(),
    );
  });

  it("notes a Google sign-in by the email, and only for Google accounts", () => {
    setup(buildUser({ authProvider: "google" }));
    expect(screen.getByText("Signed in with Google")).toBeInTheDocument();
  });

  it("shows no Google note for a password account", () => {
    setup();
    expect(screen.queryByText("Signed in with Google")).not.toBeInTheDocument();
  });
});
