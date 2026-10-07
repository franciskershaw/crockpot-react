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
    label,
    unavailable,
  }: {
    onPick: (item: Item) => void;
    label?: string;
    unavailable?: { itemIds: ReadonlySet<string>; tag: string };
  }) => (
    <button
      type="button"
      data-label={label ?? ""}
      data-unavailable={[...(unavailable?.itemIds ?? [])].join(",")}
      data-tag={unavailable?.tag ?? ""}
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
  it("hands the caller's label and unavailable items to the search", () => {
    renderRow({
      label: "Add a regular",
      unavailable: { itemIds: new Set(["i_milk"]), tag: "Already a regular" },
    });

    const search = screen.getByRole("button", { name: "search" });
    expect(search).toHaveAttribute("data-label", "Add a regular");
    expect(search).toHaveAttribute("data-unavailable", "i_milk");
    expect(search).toHaveAttribute("data-tag", "Already a regular");
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
