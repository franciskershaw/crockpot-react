import type { Item } from "@/features/catalog/data/types";
import { useCreateItem } from "@/features/catalog/hooks/useCreateItem";
import { useItemCategories } from "@/features/catalog/hooks/useItemCategories";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { ApiError } from "@/lib/http/client";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CreateItemDialog } from "./CreateItemDialog";

vi.mock("@/features/catalog/hooks/useCreateItem", () => ({
  useCreateItem: vi.fn(),
}));
vi.mock("@/features/catalog/hooks/useItemCategories", () => ({
  useItemCategories: vi.fn(),
}));
vi.mock("@/features/catalog/hooks/useUnits", () => ({ useUnits: vi.fn() }));

const mutate = vi.fn();
let isPending = false;

beforeEach(() => {
  mutate.mockReset();
  isPending = false;
  vi.mocked(useCreateItem).mockImplementation(
    () =>
      ({ mutate, isPending }) as unknown as ReturnType<typeof useCreateItem>,
  );
  vi.mocked(useItemCategories).mockReturnValue({
    data: [
      { id: "c_condiments", name: "Condiments", isIngredient: true },
      { id: "c_veg", name: "Veg", isIngredient: true },
      { id: "c_house", name: "House", isIngredient: false },
    ],
  } as unknown as ReturnType<typeof useItemCategories>);
  vi.mocked(useUnits).mockReturnValue({
    data: [
      { id: "u_g", name: "Gram", abbreviation: "g" },
      { id: "u_jar", name: "Jar", abbreviation: "jar" },
    ],
  } as unknown as ReturnType<typeof useUnits>);
});

function setup(initialName = "gochujang", ingredientsOnly = false) {
  const onCreated = vi.fn();
  const onCancel = vi.fn();
  render(
    <CreateItemDialog
      open
      initialName={initialName}
      ingredientsOnly={ingredientsOnly}
      onCreated={onCreated}
      onCancel={onCancel}
    />,
  );
  const dialog = screen.getByRole("dialog", { name: "New item" });
  const name = within(dialog).getByLabelText("Name") as HTMLInputElement;
  const create = () => within(dialog).getByRole("button", { name: /Creat/ });
  return { onCreated, onCancel, dialog, name, create };
}

async function chooseCategory(dialog: HTMLElement, category: string) {
  await userEvent.click(
    within(dialog).getByRole("combobox", { name: "Category" }),
  );
  await userEvent.click(screen.getByRole("option", { name: category }));
}

describe("CreateItemDialog", () => {
  it("opens with the name capitalised and focused, cursor at the end", () => {
    const { dialog, name } = setup("gochujang");

    expect(dialog).toHaveTextContent("Adds it to the catalogue for everyone");
    expect(name).toHaveValue("Gochujang");
    expect(name).toHaveFocus();
    expect(name.selectionStart).toBe(9);
    expect(name.selectionEnd).toBe(9);
  });

  it("offers every category by default", async () => {
    const { dialog } = setup();

    await userEvent.click(
      within(dialog).getByRole("combobox", { name: "Category" }),
    );

    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["Condiments", "Veg", "House"]);
  });

  it("offers only ingredient categories when asked to", async () => {
    const { dialog } = setup("gochujang", true);

    await userEvent.click(
      within(dialog).getByRole("combobox", { name: "Category" }),
    );

    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["Condiments", "Veg"]);
  });

  it("keeps Create disabled until a category is chosen", async () => {
    const { dialog, create } = setup();

    expect(create()).toHaveTextContent("Create item");
    expect(create()).toBeDisabled();
    await chooseCategory(dialog, "Condiments");

    expect(create()).toBeEnabled();
  });

  it("creates the item with its category and any picked units", async () => {
    const { dialog, create, onCreated } = setup();
    const created: Item = {
      id: "i_new",
      name: "Gochujang",
      categoryId: "c_condiments",
      allowedUnitIds: ["u_jar"],
    };
    mutate.mockImplementation((_input, options) =>
      options?.onSuccess?.(created),
    );

    await chooseCategory(dialog, "Condiments");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Units" }),
    );
    await userEvent.click(screen.getByRole("option", { name: /Jar/ }));
    await userEvent.keyboard("{Escape}");
    await userEvent.click(create());

    expect(mutate).toHaveBeenCalledWith(
      {
        name: "Gochujang",
        categoryId: "c_condiments",
        allowedUnitIds: ["u_jar"],
      },
      expect.anything(),
    );
    expect(onCreated).toHaveBeenCalledWith(created);
  });

  it("sends no units when none are picked", async () => {
    const { dialog, create } = setup();

    await chooseCategory(dialog, "Veg");
    await userEvent.click(create());

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ allowedUnitIds: [] }),
      expect.anything(),
    );
  });

  it("won't submit a blank name", async () => {
    const { dialog, name, create } = setup();

    await userEvent.clear(name);
    await userEvent.type(name, "   ");
    await chooseCategory(dialog, "Veg");
    await userEvent.click(create());

    expect(
      await within(dialog).findByText("Enter a name."),
    ).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("shows a duplicate name under the Name field and stays open", async () => {
    const { dialog, create, onCreated } = setup("onions");
    mutate.mockImplementation((_input, options) =>
      options?.onError?.(new ApiError(409, "name_taken")),
    );

    await chooseCategory(dialog, "Veg");
    await userEvent.click(create());

    expect(
      await within(dialog).findByText(
        'An item called "Onions" already exists.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "New item" }),
    ).toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
  });

  it("shows progress while creating", () => {
    isPending = true;
    const { create } = setup();

    expect(create()).toHaveTextContent("Creating…");
    expect(create()).toBeDisabled();
  });

  it("cancels with the Cancel button and with Escape", async () => {
    const { dialog, onCancel } = setup();

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Cancel" }),
    );
    await userEvent.keyboard("{Escape}");

    expect(onCancel).toHaveBeenCalledTimes(2);
  });
});
