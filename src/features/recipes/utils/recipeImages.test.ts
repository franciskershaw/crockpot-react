import { describe, expect, it } from "vitest";

import {
  recipeCardImage,
  recipeHeroImage,
  recipePreviewImage,
} from "./recipeImages";

const BASE = "https://res.cloudinary.com/dqdjr1d4f/image/upload/";
const ASSET = "v1665667662/Crockpot/karexo3vm57cq2japsfw.jpg";
const STORED = `${BASE}${ASSET}`;
const limited = (width: number) =>
  `${BASE}f_auto,q_auto,c_limit,w_${width}/${ASSET}`;

const candidates = (srcSet: string | undefined) =>
  (srcSet ?? "").split(", ").map((entry) => entry.split(" ")[0]);

describe("recipeCardImage", () => {
  it("loads the whole photo, width-limited, so CSS does the only crop", () => {
    const image = recipeCardImage(STORED);
    expect(image.srcSet).toBe(
      [
        `${limited(400)} 400w`,
        `${limited(800)} 800w`,
        `${limited(1200)} 1200w`,
      ].join(", "),
    );
    expect(image.sizes).toBe("(max-width: 767px) calc(100vw - 48px), 400px");
    expect(image.src).not.toContain("c_fill");
  });

  it("shares the hero's 800 and 1200 files", () => {
    const hero = candidates(recipeHeroImage(STORED).srcSet);
    const card = candidates(recipeCardImage(STORED).srcSet);
    expect(hero).toContain(limited(800));
    expect(hero).toContain(limited(1200));
    expect(card).toEqual(expect.arrayContaining([limited(800), limited(1200)]));
  });

  it("leaves a non-Cloudinary URL unchanged", () => {
    const url = "https://example.com/a.jpg";
    expect(recipeCardImage(url)).toEqual({ src: url });
  });
});

describe("recipeHeroImage", () => {
  it("offers 800/1200/1600 across the viewport", () => {
    expect(recipeHeroImage(STORED)).toEqual({
      src: limited(1600),
      srcSet: [
        `${limited(800)} 800w`,
        `${limited(1200)} 1200w`,
        `${limited(1600)} 1600w`,
      ].join(", "),
      sizes: "100vw",
    });
  });
});

describe("recipePreviewImage", () => {
  it("loads the whole photo for the form's preview box", () => {
    const image = recipePreviewImage(STORED);
    expect(candidates(image.srcSet)).toEqual([
      limited(400),
      limited(800),
      limited(1200),
    ]);
    expect(image.sizes).toBe("(min-width: 1024px) 380px, calc(100vw - 32px)");
  });
});
