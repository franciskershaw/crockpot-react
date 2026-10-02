import { afterEach, describe, expect, it, vi } from "vitest";

import { fitWithin, PhotoDecodeError, shrinkPhoto } from "./shrinkPhoto";

describe("fitWithin", () => {
  it("scales a landscape photo to the longest-side limit", () => {
    expect(fitWithin(4032, 3024)).toEqual({ width: 1600, height: 1200 });
  });

  it("scales a portrait photo to the longest-side limit", () => {
    expect(fitWithin(3024, 4032)).toEqual({ width: 1200, height: 1600 });
  });

  it("leaves a photo already within the limit unchanged", () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("rounds the short side to whole pixels", () => {
    expect(fitWithin(3000, 1999)).toEqual({ width: 1600, height: 1066 });
  });

  it("never shrinks a side below one pixel", () => {
    expect(fitWithin(10000, 2)).toEqual({ width: 1600, height: 1 });
  });
});

describe("shrinkPhoto", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports a photo the browser can't decode", async () => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockRejectedValue(new DOMException("bad", "InvalidStateError")),
    );
    const heic = new File(["not a jpeg"], "IMG_0001.HEIC", {
      type: "image/heic",
    });

    const result = shrinkPhoto(heic);

    await expect(result).rejects.toBeInstanceOf(PhotoDecodeError);
    await expect(result).rejects.toThrow(
      "Couldn't read that photo — use a JPG, PNG or WebP",
    );
  });
});
