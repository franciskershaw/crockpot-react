import { FakeIntersectionObserver } from "@/test/fakeIntersectionObserver";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSentinelInView } from "./useSentinelInView";

function List({ showSentinel }: { showSentinel: boolean }) {
  const { sentinelRef, inView } = useSentinelInView();
  return (
    <>
      <output>{inView ? "in view" : "out of view"}</output>
      {showSentinel && <div ref={sentinelRef} />}
    </>
  );
}

beforeEach(() => {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useSentinelInView", () => {
  it("ignores a report that arrives after the sentinel unmounts", () => {
    const { rerender } = render(<List showSentinel />);
    const observer = FakeIntersectionObserver.instances[0];

    rerender(<List showSentinel={false} />);
    act(() =>
      observer.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        observer as unknown as IntersectionObserver,
      ),
    );

    expect(screen.getByRole("status")).toHaveTextContent("out of view");
  });
});
