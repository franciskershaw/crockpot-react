import type { MouseEvent } from "react";
import { CurrentPath } from "@/test/CurrentPath";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HistoryBackLink } from "./HistoryBackLink";

function setup({
  historyIdx,
  onClick,
}: {
  historyIdx: number;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  // canGoBackInApp reads the real tab's history state, which MemoryRouter never writes.
  window.history.replaceState({ idx: historyIdx }, "");
  render(
    <MemoryRouter initialEntries={["/previous", "/current"]} initialIndex={1}>
      <HistoryBackLink to="/fallback" onClick={onClick}>
        Back
      </HistoryBackLink>
      <CurrentPath />
    </MemoryRouter>,
  );
}

const currentPath = () => screen.getByRole("status", { name: "path" });

describe("HistoryBackLink", () => {
  afterEach(() => {
    window.history.replaceState(null, "");
  });

  it("goes back through history when there's an earlier in-app entry", async () => {
    setup({ historyIdx: 1 });

    await userEvent.click(screen.getByRole("link", { name: "Back" }));

    expect(currentPath()).toHaveTextContent("/previous");
  });

  it("follows its link when there's no earlier in-app entry", async () => {
    setup({ historyIdx: 0 });

    await userEvent.click(screen.getByRole("link", { name: "Back" }));

    expect(currentPath()).toHaveTextContent("/fallback");
  });

  it("runs the caller's onClick", async () => {
    const onClick = vi.fn();
    setup({ historyIdx: 1, onClick });

    await userEvent.click(screen.getByRole("link", { name: "Back" }));

    expect(onClick).toHaveBeenCalledOnce();
    expect(currentPath()).toHaveTextContent("/previous");
  });

  it("stays put when the caller's onClick prevents default", async () => {
    setup({ historyIdx: 1, onClick: (event) => event.preventDefault() });

    await userEvent.click(screen.getByRole("link", { name: "Back" }));

    expect(currentPath()).toHaveTextContent("/current");
  });
});
