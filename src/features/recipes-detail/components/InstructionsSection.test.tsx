import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InstructionsSection } from "./InstructionsSection";

describe("InstructionsSection", () => {
  it("numbers each instruction starting at 1", () => {
    render(
      <InstructionsSection
        instructions={["Toss the beef in flour.", "Brown in batches."]}
      />,
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Toss the beef in flour.")).toBeInTheDocument();
    expect(screen.getByText("Brown in batches.")).toBeInTheDocument();
  });
});
