import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ErrorBoundary } from "./ErrorBoundary";

function Bomb(): never {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let reloadMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // React logs the caught render error to console itself; not under test.
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("renders children when nothing throws", () => {
    render(
      <ErrorBoundary>
        <div>fine</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText("fine")).toBeInTheDocument();
  });

  it("renders a fallback and reloads the page on retry when a child throws", async () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /reload/i }));

    expect(reloadMock).toHaveBeenCalled();
  });
});
