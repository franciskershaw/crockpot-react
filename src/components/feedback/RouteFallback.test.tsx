import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RouteFallback } from "./RouteFallback";

describe("RouteFallback", () => {
  it("renders an accessible loading status", () => {
    render(<RouteFallback />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });
});
