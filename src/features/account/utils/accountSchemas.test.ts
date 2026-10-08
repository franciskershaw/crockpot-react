import { describe, expect, it } from "vitest";

import { profileNameSchema } from "./accountSchemas";

const RULE = "Enter a name between 1 and 50 characters.";

function nameErrors(name: string) {
  const result = profileNameSchema.safeParse({ name });
  return result.success ? [] : result.error.issues.map((i) => i.message);
}

describe("profileNameSchema", () => {
  it("trims the name", () => {
    expect(profileNameSchema.parse({ name: "  Jamie Alder  " })).toEqual({
      name: "Jamie Alder",
    });
  });

  it.each(["", "   "])("rejects %j", (name) => {
    expect(nameErrors(name)).toEqual([RULE]);
  });

  it("accepts 50 characters and rejects 51", () => {
    expect(nameErrors("a".repeat(50))).toEqual([]);
    expect(nameErrors("a".repeat(51))).toEqual([RULE]);
  });

  it("counts characters, not UTF-16 units", () => {
    expect(nameErrors("😀".repeat(50))).toEqual([]);
  });
});
