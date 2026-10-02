import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { describe, expect, it } from "vitest";

import type { RecipeFormValues } from "../data/types";
import { defaultRecipeFormValues } from "../utils/recipeFormSchema";
import { DescriptionSection } from "./DescriptionSection";

function Harness({ description = "" }: { description?: string }) {
  const form = useForm<RecipeFormValues>({
    defaultValues: { ...defaultRecipeFormValues, description },
  });
  const value = useWatch({ control: form.control, name: "description" });
  return (
    <FormProvider {...form}>
      <DescriptionSection />
      <output aria-label="value">{value}</output>
    </FormProvider>
  );
}

const addButton = () =>
  screen.getByRole("button", { name: /Add a description/ });

describe("DescriptionSection", () => {
  it("is a button until opened, then a focused textarea", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.queryByLabelText("Description")).not.toBeInTheDocument();

    await user.click(addButton());

    const textarea = screen.getByLabelText("Description");
    expect(textarea).toHaveFocus();
    await user.type(textarea, "A freezer-stash regular.");
    expect(screen.getByLabelText("value")).toHaveTextContent(
      "A freezer-stash regular.",
    );
  });

  it("starts open, without taking focus, when there's already a description", () => {
    render(<Harness description="A freezer-stash regular." />);

    const textarea = screen.getByLabelText("Description");
    expect(textarea).toHaveValue("A freezer-stash regular.");
    expect(textarea).not.toHaveFocus();
  });

  it("clears the description when removed", async () => {
    const user = userEvent.setup();
    render(<Harness description="A freezer-stash regular." />);

    await user.click(
      screen.getByRole("button", { name: "Remove description" }),
    );

    expect(addButton()).toBeInTheDocument();
    expect(screen.getByLabelText("value")).toBeEmptyDOMElement();
  });
});
