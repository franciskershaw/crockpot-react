import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NotesSection } from "./NotesSection";

describe("NotesSection", () => {
  it("renders each note as a bullet under a Chef's notes heading", () => {
    render(
      <NotesSection
        notes={["Freezes brilliantly for up to 3 months.", "Swap ox cheek."]}
      />,
    );

    expect(screen.getByText("Chef's notes")).toBeInTheDocument();
    expect(
      screen.getByText("Freezes brilliantly for up to 3 months."),
    ).toBeInTheDocument();
    expect(screen.getByText("Swap ox cheek.")).toBeInTheDocument();
  });

  it("renders nothing when there are no notes", () => {
    const { container } = render(<NotesSection notes={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
