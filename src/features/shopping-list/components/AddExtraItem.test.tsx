import { useAuth } from "@/features/auth/components/AuthContext";
import type { Item, Unit } from "@/features/catalog/data/types";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAddShoppingListItem } from "../hooks/useAddShoppingListItem";
import { AddExtraItem } from "./AddExtraItem";

const chicken: Item = {
  id: "i_1",
  name: "Chicken thighs",
  categoryId: "c_1",
  allowedUnitIds: ["u_kg", "u_g"],
};

vi.mock("@/features/catalog/hooks/useUnits", () => ({ useUnits: vi.fn() }));
vi.mock("@/features/auth/components/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../hooks/useAddShoppingListItem", () => ({
  useAddShoppingListItem: vi.fn(),
}));
vi.mock("./AddItemSearch", () => ({
  AddItemSearch: ({
    onPick,
    onCreate,
    focusOnMount,
  }: {
    onPick: (item: Item) => void;
    onCreate?: (name: string) => void;
    focusOnMount?: boolean;
  }) => (
    <button
      type="button"
      data-autofocus={String(Boolean(focusOnMount))}
      data-can-create={String(Boolean(onCreate))}
      onClick={() => onPick(chicken)}
    >
      search
    </button>
  ),
}));
vi.mock("./AddItemEditor", () => ({
  AddItemEditor: ({
    item,
    allowedUnits,
    isError,
    onConfirm,
    onCancel,
  }: {
    item: Item;
    allowedUnits: Unit[];
    isError: boolean;
    onConfirm: (quantity: number, unitId: string | null) => void;
    onCancel: () => void;
  }) => (
    <div data-testid="editor" data-error={String(isError)}>
      {item.name}: {allowedUnits.map((unit) => unit.abbreviation).join(",")}
      <button type="button" onClick={() => onConfirm(2, "u_g")}>
        confirm
      </button>
      <button type="button" onClick={onCancel}>
        cancel
      </button>
    </div>
  ),
}));

const mutate = vi.fn();
const reset = vi.fn();
let isError = false;

function signInAs(role: "FREE" | "ADMIN") {
  vi.mocked(useAuth).mockReturnValue({
    user: { role },
  } as unknown as ReturnType<typeof useAuth>);
}

beforeEach(() => {
  signInAs("FREE");
  mutate.mockReset();
  isError = false;
  vi.mocked(useUnits).mockReturnValue({
    data: [
      { id: "u_g", name: "Gram", abbreviation: "g" },
      { id: "u_kg", name: "Kilogram", abbreviation: "kg" },
      { id: "u_tsp", name: "Teaspoon", abbreviation: "tsp" },
    ],
  } as unknown as ReturnType<typeof useUnits>);
  vi.mocked(useAddShoppingListItem).mockImplementation(
    () =>
      ({ mutate, reset, isPending: false, isError }) as unknown as ReturnType<
        typeof useAddShoppingListItem
      >,
  );
});

function setup() {
  const onAdded = vi.fn();
  render(<AddExtraItem onAdded={onAdded} />);
  return { onAdded };
}

describe("AddExtraItem", () => {
  it("swaps the search for the editor once an item is picked, with its allowed units in order", async () => {
    setup();

    await userEvent.click(screen.getByRole("button", { name: "search" }));

    expect(
      screen.queryByRole("button", { name: "search" }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("editor")).toHaveTextContent(
      "Chicken thighs: kg,g",
    );
  });

  it("adds the item, reports it, and returns to a focused search", async () => {
    const { onAdded } = setup();
    mutate.mockImplementation((_vars, options) => options?.onSuccess?.());

    await userEvent.click(screen.getByRole("button", { name: "search" }));
    await userEvent.click(screen.getByRole("button", { name: "confirm" }));

    expect(mutate).toHaveBeenCalledWith(
      { itemId: "i_1", quantity: 2, unitId: "u_g" },
      expect.anything(),
    );
    expect(onAdded).toHaveBeenCalledWith(
      expect.objectContaining({ itemId: "i_1", unitId: "u_g" }),
    );
    expect(screen.getByRole("button", { name: "search" })).toHaveAttribute(
      "data-autofocus",
      "true",
    );
  });

  it("keeps the editor open when the add doesn't succeed", async () => {
    const { onAdded } = setup();

    await userEvent.click(screen.getByRole("button", { name: "search" }));
    await userEvent.click(screen.getByRole("button", { name: "confirm" }));

    expect(screen.getByTestId("editor")).toBeInTheDocument();
    expect(onAdded).not.toHaveBeenCalled();
  });

  it("marks the editor as failed when the add has errored", async () => {
    isError = true;
    setup();

    await userEvent.click(screen.getByRole("button", { name: "search" }));

    expect(screen.getByTestId("editor")).toHaveAttribute("data-error", "true");
  });

  it("returns to a focused search when cancelled", async () => {
    setup();

    await userEvent.click(screen.getByRole("button", { name: "search" }));
    await userEvent.click(screen.getByRole("button", { name: "cancel" }));

    expect(screen.getByRole("button", { name: "search" })).toHaveAttribute(
      "data-autofocus",
      "true",
    );
  });

  it("doesn't grab focus on first load", () => {
    setup();

    expect(screen.getByRole("button", { name: "search" })).toHaveAttribute(
      "data-autofocus",
      "false",
    );
  });

  it("lets admins create a new item from the search", () => {
    signInAs("ADMIN");
    setup();

    expect(screen.getByRole("button", { name: "search" })).toHaveAttribute(
      "data-can-create",
      "true",
    );
  });

  it("doesn't offer item creation to non-admins", () => {
    setup();

    expect(screen.getByRole("button", { name: "search" })).toHaveAttribute(
      "data-can-create",
      "false",
    );
  });
});
