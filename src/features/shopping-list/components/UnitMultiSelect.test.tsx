import { useState } from "react";
import type { Unit } from "@/features/catalog/data/types";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UnitMultiSelect } from "./UnitMultiSelect";

const units: Unit[] = [
  { id: "u_g", name: "Gram", abbreviation: "g" },
  { id: "u_kg", name: "Kilogram", abbreviation: "kg" },
  { id: "u_pack", name: "Pack", abbreviation: "pack" },
];

function Harness({
  initial = [],
  onChange,
}: {
  initial?: string[];
  onChange: (ids: string[]) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <label htmlFor="units">Units</label>
      <UnitMultiSelect
        id="units"
        units={units}
        value={value}
        onChange={(ids) => {
          onChange(ids);
          setValue(ids);
        }}
      />
    </>
  );
}

function setup(initial: string[] = []) {
  const onChange = vi.fn();
  render(<Harness initial={initial} onChange={onChange} />);
  return { onChange, trigger: screen.getByRole("button", { name: "Units" }) };
}

describe("UnitMultiSelect", () => {
  it("reads Any unit when nothing is picked", () => {
    const { trigger } = setup();
    expect(trigger).toHaveTextContent("Any unit");
  });

  it("lists every unit with its abbreviation and toggles them, staying open", async () => {
    const { trigger, onChange } = setup();

    await userEvent.click(trigger);
    const options = screen.getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "Gramg",
      "Kilogramkg",
      "Packpack",
    ]);

    await userEvent.click(options[1]);
    await userEvent.click(screen.getAllByRole("option")[0]);
    expect(onChange).toHaveBeenLastCalledWith(["u_kg", "u_g"]);
    expect(screen.getAllByRole("option")[1]).toHaveAttribute(
      "aria-checked",
      "true",
    );

    await userEvent.click(screen.getAllByRole("option")[1]);
    expect(onChange).toHaveBeenLastCalledWith(["u_g"]);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("shows picked units as removable chips", async () => {
    const { trigger, onChange } = setup(["u_g", "u_pack"]);

    const chips = screen.getByTestId("unit-chips");
    expect(within(chips).getByText("Gram")).toBeInTheDocument();
    expect(within(chips).getByText("Pack")).toBeInTheDocument();
    expect(trigger).not.toHaveTextContent("Any unit");

    await userEvent.click(screen.getByRole("button", { name: "Remove Gram" }));

    expect(onChange).toHaveBeenLastCalledWith(["u_pack"]);
    expect(within(chips).queryByText("Gram")).not.toBeInTheDocument();
  });

  it("filters the list as you type", async () => {
    const { trigger } = setup();

    await userEvent.click(trigger);
    await userEvent.type(
      screen.getByRole("combobox", { name: "Filter units" }),
      "kilo",
    );

    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Kilogramkg",
    ]);
  });
});
