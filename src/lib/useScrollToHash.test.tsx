import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useScrollToHash } from "./useScrollToHash";

function Probe() {
  useScrollToHash();
  return null;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useScrollToHash", () => {
  it("scrolls the matching element into view when the URL has a hash", () => {
    document.body.innerHTML = '<div id="pricing"></div>';
    const scrollIntoView = vi.fn();
    document.getElementById("pricing")!.scrollIntoView = scrollIntoView;

    render(
      <MemoryRouter initialEntries={["/#pricing"]}>
        <Probe />
      </MemoryRouter>,
    );

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("does nothing when the URL has no hash", () => {
    const querySelector = vi.spyOn(document, "querySelector");

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Probe />
      </MemoryRouter>,
    );

    expect(querySelector).not.toHaveBeenCalled();
  });
});
