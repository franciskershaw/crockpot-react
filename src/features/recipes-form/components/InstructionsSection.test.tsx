import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import type { RecipeFormValues } from "../data/types";
import { defaultRecipeFormValues } from "../utils/recipeFormSchema";
import { InstructionsSection } from "./InstructionsSection";

function Harness() {
  const form = useForm<RecipeFormValues>({
    defaultValues: defaultRecipeFormValues,
  });
  return (
    <FormProvider {...form}>
      <InstructionsSection />
    </FormProvider>
  );
}

const lines = (count: number) =>
  Array.from({ length: count }, (_, i) => `Step ${i + 1} text`).join("\n");

function setup() {
  const user = userEvent.setup();
  render(<Harness />);
  const textarea = screen.getByLabelText("Instructions, one step per line");
  // fireEvent: typing hundreds of lines key by key is slow and tests nothing extra.
  const enter = (text: string) =>
    fireEvent.change(textarea, { target: { value: text } });
  return { user, enter };
}

describe("InstructionsSection", () => {
  it("counts steps against the limit as they're typed", () => {
    const { enter } = setup();

    expect(screen.getByText(/One line, one step/)).toBeInTheDocument();

    enter(lines(12));
    expect(screen.getByText("12 of 50 steps")).toBeInTheDocument();

    enter(lines(54));
    expect(
      screen.getByText("54 steps — remove 4 to publish"),
    ).toBeInTheDocument();
  });

  it("previews at most 50 steps, saying how many more there are", async () => {
    const { user, enter } = setup();
    enter(lines(53));

    await user.click(screen.getByRole("button", { name: /Preview steps/ }));

    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(50);
    expect(
      screen.getByText("+3 more steps — remove them to publish"),
    ).toBeInTheDocument();
  });
});
