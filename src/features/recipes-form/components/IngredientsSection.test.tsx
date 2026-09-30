import type { Item } from "@/features/catalog/data/types";
import { useItemCategories } from "@/features/catalog/hooks/useItemCategories";
import { useItems } from "@/features/catalog/hooks/useItems";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { IngredientsSection } from "./IngredientsSection";

vi.mock("@/features/catalog/hooks/useItems", () => ({ useItems: vi.fn() }));
vi.mock("@/features/catalog/hooks/useItemCategories", () => ({
  useItemCategories: vi.fn(),
}));
vi.mock("@/features/catalog/hooks/useUnits", () => ({ useUnits: vi.fn() }));

const catalog: Item[] = [
  { id: "i_onion", name: "Onions", categoryId: "c_veg", allowedUnitIds: [] },
  { id: "i_shin", name: "Beef shin", categoryId: "c_meat", allowedUnitIds: [] },
];

beforeEach(() => {
  vi.mocked(useItems).mockReturnValue({
    data: catalog,
  } as unknown as ReturnType<typeof useItems>);
  vi.mocked(useItemCategories).mockReturnValue({
    data: [
      { id: "c_veg", name: "Veg" },
      { id: "c_meat", name: "Meat" },
    ],
  } as unknown as ReturnType<typeof useItemCategories>);
  vi.mocked(useUnits).mockReturnValue({
    data: [{ id: "u_g", name: "Grams", abbreviation: "g" }],
  } as unknown as ReturnType<typeof useUnits>);
});

async function pick(user: ReturnType<typeof userEvent.setup>, query: string) {
  await user.type(screen.getByRole("combobox"), query);
  await user.click(
    screen.getByRole("option", { name: new RegExp(query, "i") }),
  );
}

function rows() {
  return screen.queryAllByRole("listitem");
}

describe("IngredientsSection", () => {
  it("starts empty, with no count", () => {
    render(<IngredientsSection />);

    expect(
      screen.getByText("No ingredients yet — search our list above."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Ingredients*" }),
    ).toBeInTheDocument();
  });

  it("adds a picked item as a row once its quantity is confirmed", async () => {
    const user = userEvent.setup();
    render(<IngredientsSection />);

    await pick(user, "Onions");
    const quantity = screen.getByRole("textbox", { name: "Quantity" });
    await user.clear(quantity);
    await user.type(quantity, "3{Enter}");

    expect(rows()).toHaveLength(1);
    expect(rows()[0]).toHaveTextContent("Onions");
    expect(
      within(rows()[0]).getByRole("button", {
        name: "Edit quantity of Onions",
      }),
    ).toHaveTextContent("3");
    expect(
      screen.getByRole("heading", { name: /Ingredients\*/ }),
    ).toHaveTextContent("1");
    expect(
      screen.queryByText("No ingredients yet — search our list above."),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveFocus();
  });

  it("appends later ingredients below earlier ones", async () => {
    const user = userEvent.setup();
    render(<IngredientsSection />);

    await pick(user, "Onions");
    await user.click(screen.getByRole("button", { name: "Add ingredient" }));
    await pick(user, "Beef");
    await user.click(screen.getByRole("button", { name: "Add ingredient" }));

    expect(rows().map((row) => row.textContent)).toEqual([
      expect.stringContaining("Onions"),
      expect.stringContaining("Beef shin"),
    ]);
  });

  it("adds nothing when the editor is cancelled", async () => {
    const user = userEvent.setup();
    render(<IngredientsSection />);

    await pick(user, "Onions");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(rows()).toHaveLength(0);
    expect(screen.getByRole("combobox")).toHaveFocus();
  });

  it("removes a row from its trash button", async () => {
    const user = userEvent.setup();
    render(<IngredientsSection />);

    await pick(user, "Onions");
    await user.click(screen.getByRole("button", { name: "Add ingredient" }));
    await user.click(screen.getByRole("button", { name: "Remove Onions" }));

    expect(rows()).toHaveLength(0);
    expect(
      screen.getByText("No ingredients yet — search our list above."),
    ).toBeInTheDocument();
  });
});
