import { describe, expect, it } from "vitest";

import { parseSteps } from "./parseSteps";

describe("parseSteps", () => {
  it("makes one step per line, trimmed, dropping blank lines", () => {
    expect(
      parseSteps("  Toss the beef in flour. \n\n   \nBrown it in batches.\r\n"),
    ).toEqual(["Toss the beef in flour.", "Brown it in batches."]);
  });

  it.each([
    ["1. Toss the beef", "Toss the beef"],
    ["12) Serve with mash", "Serve with mash"],
    ["Step 3: Soften the onions", "Soften the onions"],
    ["step 4 - Add the stock", "Add the stock"],
    ["STEP 5 Season to taste", "Season to taste"],
  ])("strips the leading numbering from %j", (line, expected) => {
    expect(parseSteps(line)).toEqual([expected]);
  });

  it.each([
    "1.5 litres of stock go in last",
    "2 onions, finely diced",
    "Stepping back, let it rest for 10 minutes",
  ])("keeps a line that only starts like numbering: %j", (line) => {
    expect(parseSteps(line)).toEqual([line]);
  });

  it("drops a line that was only numbering", () => {
    expect(parseSteps("1.\nBrown the beef")).toEqual(["Brown the beef"]);
  });
});
