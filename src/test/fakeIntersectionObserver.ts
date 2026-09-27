import { act } from "@testing-library/react";
import { vi } from "vitest";

// Like the real observer, only reports when told to — a dropped event is
// not repeated while the sentinel stays in view.
export class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    FakeIntersectionObserver.instances.push(this);
  }
  observe = vi.fn();
  unobserve = vi.fn();
  takeRecords = () => [];
  disconnect = () => {
    FakeIntersectionObserver.instances =
      FakeIntersectionObserver.instances.filter((i) => i !== this);
  };
  static setSentinelInView(isIntersecting: boolean) {
    act(() => {
      for (const instance of FakeIntersectionObserver.instances) {
        instance.callback(
          [{ isIntersecting } as IntersectionObserverEntry],
          instance as unknown as IntersectionObserver,
        );
      }
    });
  }
}
