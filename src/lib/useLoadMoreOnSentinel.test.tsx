import { FakeIntersectionObserver } from "@/test/fakeIntersectionObserver";
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useLoadMoreOnSentinel } from "./useLoadMoreOnSentinel";

const loadMore = vi.fn();

interface State {
  hasNextPage?: boolean;
  isFetching?: boolean;
  isError?: boolean;
}

function List(state: State) {
  const sentinelRef = useLoadMoreOnSentinel({
    hasNextPage: true,
    isFetching: false,
    isError: false,
    ...state,
    loadMore,
  });
  return <div ref={sentinelRef} />;
}

beforeEach(() => {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("useLoadMoreOnSentinel", () => {
  it("asks for more once the sentinel comes into view", () => {
    render(<List />);
    expect(loadMore).not.toHaveBeenCalled();

    FakeIntersectionObserver.setSentinelInView(true);

    expect(loadMore).toHaveBeenCalledTimes(1);
  });

  it("doesn't ask for more when there's no next page", () => {
    render(<List hasNextPage={false} />);

    FakeIntersectionObserver.setSentinelInView(true);

    expect(loadMore).not.toHaveBeenCalled();
  });

  it("asks again once a fetch settles with the sentinel still in view", () => {
    const { rerender } = render(<List />);
    FakeIntersectionObserver.setSentinelInView(true);
    rerender(<List isFetching />);
    const callsWhileFetching = loadMore.mock.calls.length;

    rerender(<List />);

    expect(loadMore).toHaveBeenCalledTimes(callsWhileFetching + 1);
  });

  it("never retries a failed page on its own, even once the sentinel comes back", () => {
    const { rerender } = render(<List />);
    FakeIntersectionObserver.setSentinelInView(true);
    const callsBeforeFailure = loadMore.mock.calls.length;

    rerender(<List isError />);
    expect(loadMore).toHaveBeenCalledTimes(callsBeforeFailure);

    FakeIntersectionObserver.setSentinelInView(false);
    FakeIntersectionObserver.setSentinelInView(true);
    expect(loadMore).toHaveBeenCalledTimes(callsBeforeFailure);
  });

  it("never retries a failed refresh on its own, even once the sentinel comes back", () => {
    const { rerender } = render(<List />);
    FakeIntersectionObserver.setSentinelInView(true);
    rerender(<List isFetching />);
    const callsBeforeFailure = loadMore.mock.calls.length;

    rerender(<List isError />);
    expect(loadMore).toHaveBeenCalledTimes(callsBeforeFailure);

    FakeIntersectionObserver.setSentinelInView(false);
    FakeIntersectionObserver.setSentinelInView(true);
    expect(loadMore).toHaveBeenCalledTimes(callsBeforeFailure);
  });

  it("asks again once a retry clears the error with the sentinel in view", () => {
    const { rerender } = render(<List isError />);
    FakeIntersectionObserver.setSentinelInView(true);
    expect(loadMore).not.toHaveBeenCalled();

    rerender(<List />);

    expect(loadMore).toHaveBeenCalledTimes(1);
  });
});
