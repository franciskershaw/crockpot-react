import { describe, expect, it } from "vitest";

import { isQuantityInput, parseQuantity } from "./quantity";

describe("isQuantityInput", () => {
  it.each(["", "1", "999999", "1.", "1.5", "999999.99", ".5"])(
    "allows %j while typing",
    (value) => expect(isQuantityInput(value)).toBe(true),
  );

  it.each(["1234567", "1.234", "1e5", "0x10", "-1", "abc", "1,5"])(
    "rejects %j",
    (value) => expect(isQuantityInput(value)).toBe(false),
  );
});

describe("parseQuantity", () => {
  it.each([
    ["1", 1],
    ["1.5", 1.5],
    ["12000", 12000],
    [".5", 0.5],
  ])("reads %j as %d", (value, expected) =>
    expect(parseQuantity(value)).toBe(expected),
  );

  it.each(["", "0", "0.00", "."])("treats %j as no quantity", (value) =>
    expect(parseQuantity(value)).toBeNull(),
  );
});
