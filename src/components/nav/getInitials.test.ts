import { describe, expect, it } from "vitest";

import { getInitials } from "./getInitials";

describe("getInitials", () => {
  it("uses the first letter of up to two name parts", () => {
    expect(getInitials("Jamie Miller", "jamie@example.com")).toBe("JM");
  });

  it("falls back to a single letter for a one-word name", () => {
    expect(getInitials("Jamie", "jamie@example.com")).toBe("J");
  });

  it("falls back to the email's first letter with no name", () => {
    expect(getInitials(null, "jamie@example.com")).toBe("J");
  });

  it("falls back to the email's first letter for a blank name", () => {
    expect(getInitials("   ", "jamie@example.com")).toBe("J");
  });
});
