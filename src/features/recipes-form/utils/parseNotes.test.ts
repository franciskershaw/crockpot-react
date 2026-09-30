import { describe, expect, it } from "vitest";

import { parseNotes } from "./parseNotes";

describe("parseNotes", () => {
  it("makes one note per line, trimmed, dropping blank lines", () => {
    expect(
      parseNotes(" Even better the next day. \n\n  \nFreezes well.\r\n"),
    ).toEqual(["Even better the next day.", "Freezes well."]);
  });

  it("keeps a note's leading numbering, unlike steps", () => {
    expect(parseNotes("1. Use chuck if you can't get shin")).toEqual([
      "1. Use chuck if you can't get shin",
    ]);
  });
});
