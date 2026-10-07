import type { Item } from "@/features/catalog/data/types";
import { useItems } from "@/features/catalog/hooks/useItems";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { ApiError } from "@/lib/http/client";
import { buildRegular } from "@/test/shoppingListFixtures";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCreateRegular } from "../hooks/useCreateRegular";
import { useDeleteRegular } from "../hooks/useDeleteRegular";
import { useRegulars } from "../hooks/useRegulars";
import { useUpdateRegular } from "../hooks/useUpdateRegular";
import { RegularsEditView } from "./RegularsEditView";

vi.mock("@/features/catalog/hooks/useItems", () => ({ useItems: vi.fn() }));
vi.mock("@/features/catalog/hooks/useUnits", () => ({ useUnits: vi.fn() }));
vi.mock("../hooks/useRegulars", () => ({ useRegulars: vi.fn() }));
vi.mock("../hooks/useUpdateRegular", () => ({ useUpdateRegular: vi.fn() }));
vi.mock("../hooks/useDeleteRegular", () => ({ useDeleteRegular: vi.fn() }));
vi.mock("../hooks/useCreateRegular", () => ({ useCreateRegular: vi.fn() }));
vi.mock("./AddItemRow", () => ({
  AddItemRow: ({
    label,
    unavailable,
    error,
    onConfirm,
  }: {
    label?: string;
    unavailable?: { itemIds: ReadonlySet<string>; tag: string };
    error?: React.ReactNode;
    onConfirm: (
      item: Item,
      quantity: number,
      unitId: string | null,
      close: () => void,
    ) => void;
  }) => (
    <div
      data-testid="add-row"
      data-label={label ?? ""}
      data-unavailable={[...(unavailable?.itemIds ?? [])].join(",")}
      data-tag={unavailable?.tag ?? ""}
    >
      {error}
      <button
        type="button"
        onClick={() =>
          onConfirm(
            {
              id: "i_eggs",
              name: "Eggs",
              categoryId: "ic_dairy",
              allowedUnitIds: [],
            },
            6,
            null,
            closeAddRow,
          )
        }
      >
        confirm eggs
      </button>
    </div>
  ),
}));

const update = vi.fn();
const remove = vi.fn();
const create = vi.fn();
const closeAddRow = vi.fn();
let createError: ApiError | null = null;

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
  createError = null;
  vi.mocked(useCreateRegular).mockImplementation(
    () =>
      ({
        mutate: create,
        reset: vi.fn(),
        isPending: false,
        isError: createError !== null,
        error: createError,
      }) as unknown as ReturnType<typeof useCreateRegular>,
  );
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

  it("shows a loading placeholder until the regulars arrive", () => {
    vi.mocked(useRegulars).mockReturnValue({
      data: undefined,
      isError: false,
    } as unknown as ReturnType<typeof useRegulars>);
    render(<RegularsEditView />);

    expect(screen.queryByText("Loading your regulars…")).toBeInTheDocument();
  });

  it("offers a retry when the regulars fail to load", async () => {
    const refetch = vi.fn();
    vi.mocked(useRegulars).mockReturnValue({
      data: undefined,
      isError: true,
      refetch,
    } as unknown as ReturnType<typeof useRegulars>);
    render(<RegularsEditView />);

    expect(
      screen.queryByText("Couldn't load your regulars."),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(refetch).toHaveBeenCalled();
  });

  it("shows the empty state under the search when there are no regulars", () => {
    vi.mocked(useRegulars).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useRegulars>);
    render(<RegularsEditView />);

    expect(screen.getByTestId("add-row")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "No regulars yet" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/^Search above for the things you buy most weeks/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Add a regular/ }),
    ).not.toBeInTheDocument();
  });

  describe("adding a regular", () => {
    it("offers the search as Add a regular, marking every current regular", () => {
      render(<RegularsEditView />);

      const row = screen.getByTestId("add-row");
      expect(row).toHaveAttribute("data-label", "Add a regular");
      expect(row).toHaveAttribute("data-unavailable", "i_milk,i_butter,i_tp");
      expect(row).toHaveAttribute("data-tag", "Already a regular");
    });

    it("creates the regular, then returns to the search", async () => {
      create.mockImplementation(
        (_input: unknown, options?: { onSuccess?: () => void }) =>
          options?.onSuccess?.(),
      );
      render(<RegularsEditView />);

      await userEvent.click(
        screen.getByRole("button", { name: "confirm eggs" }),
      );

      expect(create).toHaveBeenCalledWith(
        { itemId: "i_eggs", quantity: 6, unitId: null },
        expect.anything(),
      );
      expect(closeAddRow).toHaveBeenCalled();
    });

    it("explains a regular that already exists", () => {
      createError = new ApiError(409, "regular_exists");
      render(<RegularsEditView />);

      expect(screen.getByTestId("add-row")).toHaveTextContent(
        "That's already one of your regulars.",
      );
    });

    it("explains the regulars limit", () => {
      createError = new ApiError(409, "regulars_limit_reached");
      render(<RegularsEditView />);

      expect(screen.getByTestId("add-row")).toHaveTextContent(
        "You've reached the 50-regular limit. Remove one to add another.",
      );
    });
  });
});
