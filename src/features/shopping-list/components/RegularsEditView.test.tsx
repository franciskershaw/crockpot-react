import { useItems } from "@/features/catalog/hooks/useItems";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { buildRegular } from "@/test/shoppingListFixtures";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDeleteRegular } from "../hooks/useDeleteRegular";
import { useRegulars } from "../hooks/useRegulars";
import { useUpdateRegular } from "../hooks/useUpdateRegular";
import { RegularsEditView } from "./RegularsEditView";

vi.mock("@/features/catalog/hooks/useItems", () => ({ useItems: vi.fn() }));
vi.mock("@/features/catalog/hooks/useUnits", () => ({ useUnits: vi.fn() }));
vi.mock("../hooks/useRegulars", () => ({ useRegulars: vi.fn() }));
vi.mock("../hooks/useUpdateRegular", () => ({ useUpdateRegular: vi.fn() }));
vi.mock("../hooks/useDeleteRegular", () => ({ useDeleteRegular: vi.fn() }));

const update = vi.fn();
const remove = vi.fn();

const regulars = [
  buildRegular({
    id: "reg_milk",
    itemId: "i_milk",
    itemName: "Milk",
    unitId: "u_pt",
    unitAbbreviation: "pt",
    quantity: 2,
  }),
  buildRegular({
    id: "reg_butter",
    itemId: "i_butter",
    itemName: "Butter",
    unitId: "u_g",
    unitAbbreviation: "g",
    quantity: 250,
  }),
  buildRegular({
    id: "reg_tp",
    itemId: "i_tp",
    itemName: "Toilet paper",
    categoryId: "ic_house",
    categoryName: "House",
    unitId: "u_rolls",
    unitAbbreviation: "rolls",
    quantity: 9,
  }),
];

beforeEach(() => {
  vi.mocked(useRegulars).mockReturnValue({
    data: regulars,
  } as unknown as ReturnType<typeof useRegulars>);
  vi.mocked(useItems).mockReturnValue({
    data: [
      {
        id: "i_milk",
        name: "Milk",
        categoryId: "ic_dairy",
        allowedUnitIds: ["u_pt"],
      },
      {
        id: "i_butter",
        name: "Butter",
        categoryId: "ic_dairy",
        allowedUnitIds: ["u_g", "u_kg"],
      },
      {
        id: "i_tp",
        name: "Toilet paper",
        categoryId: "ic_house",
        allowedUnitIds: [],
      },
    ],
  } as unknown as ReturnType<typeof useItems>);
  vi.mocked(useUnits).mockReturnValue({
    data: [
      { id: "u_pt", name: "Pint", abbreviation: "pt" },
      { id: "u_g", name: "Gram", abbreviation: "g" },
      { id: "u_kg", name: "Kilogram", abbreviation: "kg" },
      { id: "u_rolls", name: "Rolls", abbreviation: "rolls" },
    ],
  } as unknown as ReturnType<typeof useUnits>);
  vi.mocked(useUpdateRegular).mockReturnValue({
    mutate: update,
  } as unknown as ReturnType<typeof useUpdateRegular>);
  vi.mocked(useDeleteRegular).mockReturnValue({
    mutate: remove,
  } as unknown as ReturnType<typeof useDeleteRegular>);
});

afterEach(() => {
  vi.clearAllMocks();
});

async function openEditorFor(name: string) {
  await userEvent.click(
    screen.getByRole("button", { name: `Edit quantity of ${name}` }),
  );
}

describe("RegularsEditView", () => {
  it("lists the regulars by category, each editable and removable", () => {
    render(<RegularsEditView />);

    const dairy = screen.queryByRole("group", { name: "Dairy" });
    expect(dairy).toBeInTheDocument();
    expect(within(dairy!).getByText("Butter")).toBeInTheDocument();
    expect(
      within(dairy!).getByRole("button", { name: "Edit quantity of Butter" }),
    ).toBeInTheDocument();
    expect(
      within(dairy!).getByRole("button", { name: "Remove Butter" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "House" })).toHaveTextContent(
      "Toilet paper",
    );
  });

  it("saves a changed quantity, keeping the unit", async () => {
    render(<RegularsEditView />);
    expect(
      screen.queryByRole("button", { name: "Edit quantity of Butter" }),
    ).toBeInTheDocument();

    await openEditorFor("Butter");
    const input = await screen.findByLabelText("Quantity");
    await userEvent.clear(input);
    await userEvent.type(input, "300{Enter}");

    expect(update).toHaveBeenCalledWith({
      id: "reg_butter",
      quantity: 300,
      unitId: "u_g",
    });
  });

  it("offers only the units the item allows", async () => {
    render(<RegularsEditView />);
    expect(
      screen.queryByRole("button", { name: "Edit quantity of Butter" }),
    ).toBeInTheDocument();

    await openEditorFor("Butter");
    await userEvent.click(screen.getByRole("combobox", { name: "Unit" }));

    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["No unit", "Gramg", "Kilogramkg"]);
  });

  it("removes a regular straight away, without asking", async () => {
    render(<RegularsEditView />);
    expect(
      screen.queryByRole("button", { name: "Remove Milk" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Remove Milk" }));

    expect(remove).toHaveBeenCalledWith({ id: "reg_milk" });
  });
});
