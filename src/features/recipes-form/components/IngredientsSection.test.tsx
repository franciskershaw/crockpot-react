import { useAuth } from "@/features/auth/components/AuthContext";
import type { Item } from "@/features/catalog/data/types";
import { useItemCategories } from "@/features/catalog/hooks/useItemCategories";
import { useItems } from "@/features/catalog/hooks/useItems";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { buildUser } from "@/test/authFixtures";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RecipeFormValues } from "../data/types";
import { defaultRecipeFormValues } from "../utils/recipeFormSchema";
import { IngredientsSection } from "./IngredientsSection";

vi.mock("@/features/catalog/hooks/useItems", () => ({ useItems: vi.fn() }));
vi.mock("@/features/catalog/hooks/useItemCategories", () => ({
  useItemCategories: vi.fn(),
}));
vi.mock("@/features/catalog/hooks/useUnits", () => ({ useUnits: vi.fn() }));
vi.mock("@/features/auth/components/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("@/features/catalog/components/CreateItemDialog", () => ({
  CreateItemDialog: ({
    open,
    initialName,
    onCreated,
    onCancel,
  }: {
    open: boolean;
    initialName: string;
    onCreated: (item: Item) => void;
    onCancel: () => void;
  }) =>
    open ? (
      <div data-testid="create-dialog">
        {initialName}
        <button
          type="button"
          onClick={() =>
            onCreated({
              id: "i_new",
              name: "Gochujang",
              categoryId: "c_veg",
              allowedUnitIds: [],
            })
          }
        >
          created
        </button>
        <button type="button" onClick={onCancel}>
          cancel dialog
        </button>
      </div>
    ) : null,
}));

function Harness() {
  const form = useForm<RecipeFormValues>({
    defaultValues: defaultRecipeFormValues,
  });
  return (
    <FormProvider {...form}>
      <IngredientsSection />
    </FormProvider>
  );
}

function renderSection() {
  render(<Harness />);
}

function signInAs(role: "ADMIN" | "FREE") {
  vi.mocked(useAuth).mockReturnValue({
    user: buildUser({ role }),
    isAuthenticated: true,
    isLoading: false,
  } as ReturnType<typeof useAuth>);
}

const catalog: Item[] = [
  { id: "i_onion", name: "Onions", categoryId: "c_veg", allowedUnitIds: [] },
  { id: "i_shin", name: "Beef shin", categoryId: "c_meat", allowedUnitIds: [] },
];

beforeEach(() => {
  signInAs("FREE");
  vi.mocked(useItems).mockReturnValue({
    data: catalog,
  } as unknown as ReturnType<typeof useItems>);
  vi.mocked(useItemCategories).mockReturnValue({
    data: [
      { id: "c_veg", name: "Veg", isIngredient: true },
      { id: "c_meat", name: "Meat", isIngredient: true },
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
    renderSection();

    expect(
      screen.getByText("No ingredients yet — search our list above."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Ingredients*" }),
    ).toBeInTheDocument();
  });

  it("adds a picked item as a row once its quantity is confirmed", async () => {
    const user = userEvent.setup();
    renderSection();

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
    renderSection();

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
    renderSection();

    await pick(user, "Onions");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(rows()).toHaveLength(0);
    expect(screen.getByRole("combobox")).toHaveFocus();
  });

  it("removes a row from its trash button", async () => {
    const user = userEvent.setup();
    renderSection();

    await pick(user, "Onions");
    await user.click(screen.getByRole("button", { name: "Add ingredient" }));
    await user.click(screen.getByRole("button", { name: "Remove Onions" }));

    expect(rows()).toHaveLength(0);
    expect(
      screen.getByText("No ingredients yet — search our list above."),
    ).toBeInTheDocument();
  });

  it("changes a row's unit from its quantity editor", async () => {
    const user = userEvent.setup();
    renderSection();

    await pick(user, "Onions");
    await user.click(screen.getByRole("button", { name: "Add ingredient" }));
    await user.click(
      screen.getByRole("button", { name: "Edit quantity of Onions" }),
    );
    await user.click(screen.getByRole("combobox", { name: "Unit" }));
    await user.click(screen.getByRole("option", { name: /Grams/ }));
    await user.click(
      await screen.findByRole("button", { name: "Confirm quantity" }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole("combobox", { name: "Unit" }),
      ).not.toBeInTheDocument(),
    );
    expect(rows()[0]).toHaveTextContent(/1\s*g\s*Onions/);
  });

  it("opens the existing row's editor when a listed item is picked again", async () => {
    const user = userEvent.setup();
    renderSection();

    await pick(user, "Onions");
    await user.click(screen.getByRole("button", { name: "Add ingredient" }));
    await pick(user, "Onions");

    expect(rows()).toHaveLength(1);
    expect(
      screen.queryByRole("button", { name: "Add ingredient" }),
    ).not.toBeInTheDocument();
    expect(within(rows()[0]).getByLabelText("Quantity")).toHaveFocus();
  });

  it("lets admins create a new item and add it", async () => {
    signInAs("ADMIN");
    const user = userEvent.setup();
    renderSection();

    await user.type(screen.getByRole("combobox"), "Gochujang");
    await user.click(
      screen.getByRole("option", { name: /Add “Gochujang” as a new item/ }),
    );
    await user.click(await screen.findByRole("button", { name: "created" }));
    await user.click(screen.getByRole("button", { name: "Add ingredient" }));

    expect(rows()).toHaveLength(1);
    expect(rows()[0]).toHaveTextContent("Gochujang");
  });

  it("returns to the search, with its query, when new-item creation is cancelled", async () => {
    signInAs("ADMIN");
    const user = userEvent.setup();
    renderSection();

    await user.type(screen.getByRole("combobox"), "Gochujang");
    await user.click(
      screen.getByRole("option", { name: /Add “Gochujang” as a new item/ }),
    );
    await user.click(
      await screen.findByRole("button", { name: "cancel dialog" }),
    );

    expect(rows()).toHaveLength(0);
    expect(screen.getByRole("combobox")).toHaveValue("Gochujang");
  });

  it("doesn't offer item creation to non-admins", async () => {
    const user = userEvent.setup();
    renderSection();

    await user.type(screen.getByRole("combobox"), "Gochujang");

    expect(
      screen.queryByRole("option", { name: /as a new item/ }),
    ).not.toBeInTheDocument();
  });
});
