import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import App from "./App";

test("renders the app shell without throwing", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: "Crockpot" })).toBeInTheDocument();
});
