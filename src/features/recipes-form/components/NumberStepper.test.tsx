import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { NumberStepper } from "./NumberStepper";

function Harness({ initial }: { initial: number }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <NumberStepper
        label="cooking time"
        value={value}
        onChange={setValue}
        min={1}
        max={1440}
        step={5}
      />
      <output aria-label="committed">{value}</output>
    </>
  );
}

function setup(initial: number) {
  render(<Harness initial={initial} />);
  return {
    user: userEvent.setup(),
    input: screen.getByRole("textbox", { name: "cooking time" }),
    decrease: screen.getByRole("button", { name: "Decrease cooking time" }),
    increase: screen.getByRole("button", { name: "Increase cooking time" }),
    committed: () => screen.getByLabelText("committed").textContent,
  };
}

describe("NumberStepper", () => {
  it("steps up and down by the step", async () => {
    const { user, increase, decrease, input, committed } = setup(30);

    await user.click(increase);
    expect(committed()).toBe("35");
    expect(input).toHaveValue("35");

    await user.click(decrease);
    await user.click(decrease);
    expect(committed()).toBe("25");
  });

  it("clamps a step to the bounds and disables the button at a bound", async () => {
    const low = setup(3);
    await low.user.click(low.decrease);
    expect(low.committed()).toBe("1");
    expect(low.decrease).toBeDisabled();
    expect(low.increase).toBeEnabled();
  });

  it("clamps a step at the maximum", async () => {
    const { user, increase, committed } = setup(1438);

    await user.click(increase);

    expect(committed()).toBe("1440");
    expect(increase).toBeDisabled();
  });

  it("commits a typed value on blur", async () => {
    const { user, input, committed } = setup(30);

    await user.clear(input);
    await user.type(input, "45");
    await user.tab();

    expect(committed()).toBe("45");
  });

  it("commits a typed value on Enter", async () => {
    const { user, input, committed } = setup(30);

    await user.clear(input);
    await user.type(input, "90{Enter}");

    expect(committed()).toBe("90");
  });

  it.each([
    ["2000", "1440"],
    ["0", "1"],
  ])("clamps a typed %s to %s", async (typed, expected) => {
    const { user, input, committed } = setup(30);

    await user.clear(input);
    await user.type(input, typed);
    await user.tab();

    expect(committed()).toBe(expected);
    expect(input).toHaveValue(expected);
  });

  it("reverts to the last value when left empty", async () => {
    const { user, input, committed } = setup(30);

    await user.clear(input);
    await user.tab();

    expect(committed()).toBe("30");
    expect(input).toHaveValue("30");
  });

  it("ignores anything but digits", async () => {
    const { user, input } = setup(30);

    await user.clear(input);
    await user.type(input, "4a5.");

    expect(input).toHaveValue("45");
  });
});
