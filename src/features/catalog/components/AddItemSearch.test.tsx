import type { Item } from "@/features/catalog/data/types";
import { useItemCategories } from "@/features/catalog/hooks/useItemCategories";
import { useItems } from "@/features/catalog/hooks/useItems";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AddItemSearch } from "./AddItemSearch";

vi.mock("@/features/catalog/hooks/useItems", () => ({ useItems: vi.fn() }));
vi.mock("@/features/catalog/hooks/useItemCategories", () => ({
  useItemCategories: vi.fn(),
}));

function item(id: string, name: string, categoryId = "c_meat"): Item {
  return { id, name, categoryId, allowedUnitIds: [] };
}

const catalog = [
  item("i_1", "Red chillies", "c_veg"),
  item("i_2", "Chicken thighs"),
  item("i_3", "Chickpeas", "c_cupboard"),
  item("i_4", "Onions", "c_veg"),
  item("i_5", "Wick candles", "c_house"),
];

beforeEach(() => {
  vi.mocked(useItems).mockReturnValue({
    data: catalog,
  } as unknown as ReturnType<typeof useItems>);
  vi.mocked(useItemCategories).mockReturnValue({
    data: [
      { id: "c_meat", name: "Meat", isIngredient: true },
      { id: "c_veg", name: "Veg", isIngredient: true },
      { id: "c_cupboard", name: "Cupboard", isIngredient: true },
      { id: "c_house", name: "House", isIngredient: false },
    ],
  } as unknown as ReturnType<typeof useItemCategories>);
});

function setup() {
  const onPick = vi.fn();
  render(<AddItemSearch onPick={onPick} />);
  const input = screen.getByRole("combobox", { name: "Add something extra" });
  return { onPick, input };
}

function optionNames() {
  return screen
    .getAllByRole("option")
    .map((option) => option.getAttribute("data-value"));
}

describe("AddItemSearch", () => {
  it("shows no results until something is typed", () => {
    setup();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("lists matching items, ranked, with their categories", async () => {
    const { input } = setup();

    await userEvent.type(input, "chi");

    await screen.findByRole("listbox");
    expect(optionNames()).toEqual(["i_2", "i_3", "i_1"]);
    const first = screen.getAllByRole("option")[0];
    expect(first).toHaveTextContent("Chicken thighs");
    expect(first).toHaveTextContent("Meat");
    expect(within(first).getByText("Chi").tagName).toBe("STRONG");
  });

  it("highlights the first result and picks it on Enter", async () => {
    const { input, onPick } = setup();

    await userEvent.type(input, "chi");
    await screen.findByRole("listbox");
    expect(screen.getAllByRole("option")[0]).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.keyboard("{Enter}");

    expect(onPick).toHaveBeenCalledWith(catalog[1]);
    expect(input).toHaveValue("");
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );
  });

  it("moves the highlight with the arrow keys, wrapping round", async () => {
    const { input, onPick } = setup();

    await userEvent.type(input, "chi");
    await screen.findByRole("listbox");
    await userEvent.keyboard("{ArrowUp}{Enter}");

    expect(onPick).toHaveBeenCalledWith(catalog[0]);
  });

  it("picks a result when clicked", async () => {
    const { input, onPick } = setup();

    await userEvent.type(input, "onio");
    await userEvent.click(await screen.findByRole("option"));

    expect(onPick).toHaveBeenCalledWith(catalog[3]);
  });

  it("closes on the first Escape and clears the text on the second", async () => {
    const { input } = setup();

    await userEvent.type(input, "chi");
    await screen.findByRole("listbox");
    await userEvent.keyboard("{Escape}");

    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );
    expect(input).toHaveValue("chi");

    await userEvent.keyboard("{Escape}");
    expect(input).toHaveValue("");
  });

  it("says when nothing matches", async () => {
    const { input } = setup();

    await userEvent.type(input, "gochujang");

    expect(
      await screen.findByText("Nothing called “gochujang” yet."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("clears the text with the clear button, shown only once there's text", async () => {
    const { input } = setup();
    expect(
      screen.queryByRole("button", { name: "Clear search" }),
    ).not.toBeInTheDocument();

    await userEvent.type(input, "chi");
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );
  });

  it("focuses the input on mount only when asked to", () => {
    const { unmount } = render(<AddItemSearch onPick={vi.fn()} />);
    expect(
      screen.getByRole("combobox", { name: "Add something extra" }),
    ).not.toHaveFocus();
    unmount();

    render(<AddItemSearch onPick={vi.fn()} focusOnMount />);
    expect(
      screen.getByRole("combobox", { name: "Add something extra" }),
    ).toHaveFocus();
  });

  describe("admin add-new row", () => {
    function setupAdmin() {
      const onPick = vi.fn();
      const onCreate = vi.fn();
      render(<AddItemSearch onPick={onPick} onCreate={onCreate} />);
      const input = screen.getByRole("combobox", {
        name: "Add something extra",
      });
      return { onPick, onCreate, input };
    }

    it("offers to add the query as a new item after the results", async () => {
      const { input, onCreate } = setupAdmin();

      await userEvent.type(input, " chi ");
      const addRow = await screen.findByRole("option", {
        name: "Add “chi” as a new item",
      });
      expect(screen.getAllByRole("option").at(-1)).toBe(addRow);
      await userEvent.click(addRow);

      expect(onCreate).toHaveBeenCalledWith("chi");
      expect(input).toHaveValue(" chi ");
      await waitFor(() =>
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
      );
    });

    it("highlights the add row when nothing matches, so Enter creates", async () => {
      const { input, onCreate } = setupAdmin();

      await userEvent.type(input, "gochujang");
      expect(
        await screen.findByText("Nothing called “gochujang” yet."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Add “gochujang” as a new item" }),
      ).toHaveAttribute("aria-selected", "true");
      await userEvent.keyboard("{Enter}");

      expect(onCreate).toHaveBeenCalledWith("gochujang");
    });

    it("reaches the add row with the arrow keys", async () => {
      const { input, onCreate, onPick } = setupAdmin();

      await userEvent.type(input, "chi");
      await screen.findByRole("listbox");
      await userEvent.keyboard("{ArrowUp}{Enter}");

      expect(onCreate).toHaveBeenCalledWith("chi");
      expect(onPick).not.toHaveBeenCalled();
    });

    it("isn't offered when an item with that exact name exists", async () => {
      const { input } = setupAdmin();

      await userEvent.type(input, "ONIONS");
      await screen.findByRole("listbox");

      expect(
        screen.queryByRole("option", { name: /as a new item/ }),
      ).not.toBeInTheDocument();
    });
  });

  it("never offers the add row without onCreate", async () => {
    const { input } = setup();

    await userEvent.type(input, "gochujang");
    await screen.findByText("Nothing called “gochujang” yet.");

    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("reopens the list for its current query when resumed", async () => {
    const onCreate = vi.fn();
    const { rerender } = render(
      <AddItemSearch onPick={vi.fn()} onCreate={onCreate} resumeKey={0} />,
    );
    const input = screen.getByRole("combobox", { name: "Add something extra" });
    await userEvent.type(input, "gochujang");
    await userEvent.click(
      await screen.findByRole("option", { name: /as a new item/ }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );

    rerender(
      <AddItemSearch onPick={vi.fn()} onCreate={onCreate} resumeKey={1} />,
    );

    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    expect(input).toHaveValue("gochujang");
  });

  describe("unavailable items", () => {
    function setupUnavailable() {
      const onPick = vi.fn();
      render(
        <AddItemSearch
          onPick={onPick}
          unavailable={{ itemIds: new Set(["i_2"]), tag: "Already a regular" }}
        />,
      );
      const input = screen.getByRole("combobox", {
        name: "Add something extra",
      });
      return { onPick, input };
    }

    it("takes the caller's label", () => {
      render(<AddItemSearch onPick={vi.fn()} label="Add a regular" />);

      expect(
        screen.queryByRole("combobox", { name: "Add a regular" }),
      ).toBeInTheDocument();
    });

    it("shows the caller's tag in place of the category and won't pick it", async () => {
      const { input, onPick } = setupUnavailable();

      await userEvent.type(input, "chi");
      const thighs = (await screen.findAllByRole("option"))[0];

      expect(thighs).toHaveAttribute("aria-disabled", "true");
      expect(thighs).toHaveTextContent("Already a regular");
      expect(thighs).not.toHaveTextContent("Meat");
      await userEvent.click(thighs);
      expect(onPick).not.toHaveBeenCalled();
    });

    it("skips it when highlighting, so Enter picks the next match", async () => {
      const { input, onPick } = setupUnavailable();

      await userEvent.type(input, "chi");
      await screen.findByRole("listbox");
      await userEvent.keyboard("{Enter}");

      expect(onPick).toHaveBeenCalledWith(catalog[2]);
    });
  });

  it("in the recipe variant, searches ingredients and shows category icons, not names", async () => {
    render(<AddItemSearch variant="recipe" onPick={vi.fn()} />);
    const input = screen.getByRole("combobox", { name: "Search ingredients" });

    await userEvent.type(input, "chi");

    const option = screen.getAllByRole("option")[0];
    expect(option).toHaveTextContent(/^Chicken thighs$/);
    expect(option.querySelector("svg")).not.toBeNull();
  });

  it("in the recipe variant, leaves out items that aren't ingredients", async () => {
    render(<AddItemSearch variant="recipe" onPick={vi.fn()} />);

    await userEvent.type(
      screen.getByRole("combobox", { name: "Search ingredients" }),
      "ick",
    );

    await screen.findByRole("listbox");
    expect(optionNames()).toEqual(["i_2", "i_3"]);
  });

  it("in the shopping variant, still offers items that aren't ingredients", async () => {
    const { input } = setup();

    await userEvent.type(input, "ick");

    await screen.findByRole("listbox");
    expect(optionNames()).toEqual(["i_2", "i_3", "i_5"]);
  });
});
