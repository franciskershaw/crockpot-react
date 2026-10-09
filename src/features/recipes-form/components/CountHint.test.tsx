import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CountHint } from "./CountHint";

function setup(count: number) {
  render(
    <CountHint
      count={count}
      max={10}
      noun="notes"
      emptyHint="One line, one note — up to 10."
    />,
  );
}

describe("CountHint", () => {
  it("shows the empty hint when there's nothing yet", () => {
    setup(0);

    expect(
      screen.getByText("One line, one note — up to 10."),
    ).toBeInTheDocument();
  });

  it("counts against the max while within it", () => {
    setup(10);

    expect(screen.getByText("10 of 10 notes")).not.toHaveClass(
      "text-rust-text",
    );
  });

  it("says how many to remove, in the warning colour, once over the max", () => {
    setup(13);

    expect(screen.getByText("13 notes — remove 3 to publish")).toHaveClass(
      "text-rust-text",
    );
  });
});
