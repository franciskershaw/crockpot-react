import { useAuth } from "@/features/auth/components/AuthContext";
import type { Item } from "@/features/catalog/data/types";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AddItemRow } from "./AddItemRow";

const milk: Item = {
  id: "i_milk",
  name: "Milk",
  categoryId: "c_dairy",
  allowedUnitIds: [],
};

vi.mock("@/features/catalog/hooks/useUnits", () => ({ useUnits: vi.fn() }));
vi.mock("@/features/auth/components/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("@/features/catalog/components/AddItemSearch", () => ({
  AddItemSearch: ({
    onPick,
    focusOnMount,
  }: {
    onPick: (item: Item) => void;
    focusOnMount?: boolean;
  }) => (
    <button
      type="button"
      data-autofocus={String(Boolean(focusOnMount))}
      onClick={() => onPick(milk)}
    >
      search
    </button>
  ),
}));
vi.mock("@/features/catalog/components/AddItemEditor", () => ({
  AddItemEditor: () => <div data-testid="editor" />,
}));

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({
    user: { role: "FREE" },
  } as unknown as ReturnType<typeof useAuth>);
  vi.mocked(useUnits).mockReturnValue({
    data: [],
  } as unknown as ReturnType<typeof useUnits>);
});

function renderRow(props: Partial<Parameters<typeof AddItemRow>[0]> = {}) {
  render(
    <AddItemRow
      isPending={false}
      isError={false}
      onReset={vi.fn()}
      onConfirm={vi.fn()}
      {...props}
    />,
  );
}

describe("AddItemRow", () => {
  it("focuses the search on first load when asked", () => {
    renderRow({ focusOnMount: true });

    expect(screen.getByRole("button", { name: "search" })).toHaveAttribute(
      "data-autofocus",
      "true",
    );
  });

  it("shows the caller's error under the editor", async () => {
    renderRow({ error: "That's already one of your regulars." });

    await userEvent.click(screen.getByRole("button", { name: "search" }));

    expect(screen.getByTestId("editor")).toBeInTheDocument();
    expect(
      screen.queryByText("That's already one of your regulars."),
    ).toBeInTheDocument();
  });
});
