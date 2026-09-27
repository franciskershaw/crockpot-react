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
];

beforeEach(() => {
  vi.mocked(useItems).mockReturnValue({
    data: catalog,
  } as unknown as ReturnType<typeof useItems>);
  vi.mocked(useItemCategories).mockReturnValue({
    data: [
      { id: "c_meat", name: "Meat" },
      { id: "c_veg", name: "Veg" },
      { id: "c_cupboard", name: "Cupboard" },
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
});
