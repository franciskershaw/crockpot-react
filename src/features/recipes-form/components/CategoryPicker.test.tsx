import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CategoryPicker } from "./CategoryPicker";

const CATEGORIES = ["Batch", "Speedy", "Veggie", "Meaty", "Group"].map(
  (name) => ({ id: name.toLowerCase(), name }),
);

function Harness({ initial }: { initial: string[] }) {
  const [ids, setIds] = useState(initial);
  return (
    <>
      <CategoryPicker
        categories={CATEGORIES}
        selectedIds={ids}
        onChange={setIds}
      />
      <output aria-label="selected">{ids.join(",")}</output>
    </>
  );
}

async function openPicker(initial: string[]) {
  const user = userEvent.setup();
  render(<Harness initial={initial} />);
  await user.click(screen.getByRole("button", { name: /Add category/ }));
  return {
    user,
    selected: () => screen.getByLabelText("selected").textContent,
  };
}

describe("CategoryPicker", () => {
  it("adds and removes categories from the checklist", async () => {
    const { user, selected } = await openPicker([]);

    await user.click(screen.getByRole("checkbox", { name: "Veggie" }));
    await user.click(screen.getByRole("checkbox", { name: "Batch" }));
    expect(selected()).toBe("veggie,batch");

    await user.click(screen.getByRole("checkbox", { name: "Veggie" }));
    expect(selected()).toBe("batch");
  });

  it("removes a category from its chip", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["batch", "speedy"]} />);

    await user.click(screen.getByRole("button", { name: "Remove Batch" }));

    expect(screen.getByLabelText("selected")).toHaveTextContent("speedy");
    expect(
      screen.queryByRole("button", { name: "Remove Batch" }),
    ).not.toBeInTheDocument();
  });

  it("at three, disables the unchecked options and says why", async () => {
    await openPicker(["batch", "speedy", "veggie"]);

    expect(screen.getByRole("checkbox", { name: "Meaty" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Group" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Batch" })).toBeEnabled();
    expect(
      screen.getByText("Up to 3. Remove one to add another."),
    ).toBeInTheDocument();
  });

  it("frees the options again once one is unchecked at the cap", async () => {
    const { user, selected } = await openPicker(["batch", "speedy", "veggie"]);

    await user.click(screen.getByRole("checkbox", { name: "Speedy" }));
    await user.click(screen.getByRole("checkbox", { name: "Meaty" }));

    expect(selected()).toBe("batch,veggie,meaty");
  });
});
