import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("lets a later shadow class override a custom shadow token", () => {
    expect(cn("shadow-panel", "shadow-none")).toBe("shadow-none");
  });
});
