import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UndoTile } from "./UndoTile";

function renderTile(paused = false) {
  const onPause = vi.fn();
  const onResume = vi.fn();
  render(
    <UndoTile
      title="Fajita Wraps"
      canUndo
      onUndo={vi.fn()}
      paused={paused}
      countdownKey={1}
      onPause={onPause}
      onResume={onResume}
    />,
  );
  return { tile: screen.getByRole("status"), onPause, onResume };
}

describe("UndoTile", () => {
  it("holds the countdown while the pointer is over it", () => {
    const { tile, onPause, onResume } = renderTile();

    fireEvent.pointerEnter(tile);
    expect(onPause).toHaveBeenCalledTimes(1);

    fireEvent.pointerLeave(tile);
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it("holds the countdown while focus is inside it", () => {
    const { onPause, onResume } = renderTile();
    const undo = screen.getByRole("button", { name: "Undo" });

    fireEvent.focus(undo);
    expect(onPause).toHaveBeenCalledTimes(1);

    fireEvent.blur(undo);
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it("shows a countdown bar that stops while paused", () => {
    renderTile(true);
    expect(screen.getByTestId("undo-countdown")).toHaveStyle({
      animationPlayState: "paused",
    });
  });

  it("runs the countdown bar otherwise", () => {
    renderTile(false);
    expect(screen.getByTestId("undo-countdown")).toHaveStyle({
      animationPlayState: "running",
    });
  });
});
