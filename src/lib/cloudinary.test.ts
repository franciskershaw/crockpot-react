import { describe, expect, it } from "vitest";

import { fillImage, limitImage } from "./cloudinary";

const BASE = "https://res.cloudinary.com/dqdjr1d4f/image/upload/";
const STORED = `${BASE}v1665667662/Crockpot/karexo3vm57cq2japsfw.jpg`;
const ASSET = "v1665667662/Crockpot/karexo3vm57cq2japsfw.jpg";

describe("fillImage", () => {
  it("crops to the box at 1x and 2x", () => {
    expect(fillImage(STORED, 400, 180)).toEqual({
      src: `${BASE}f_auto,q_auto,c_fill,g_auto,w_400,h_180/${ASSET}`,
      srcSet: [
        `${BASE}f_auto,q_auto,c_fill,g_auto,w_400,h_180/${ASSET} 1x`,
        `${BASE}f_auto,q_auto,c_fill,g_auto,w_800,h_360/${ASSET} 2x`,
      ].join(", "),
    });
  });

  it("leaves a non-Cloudinary URL unchanged", () => {
    const url = "blob:http://localhost:5173/8f1c2d";
    expect(fillImage(url, 56, 56)).toEqual({ src: url });
  });
});

describe("limitImage", () => {
  it("offers each width, falling back to the largest", () => {
    expect(limitImage(STORED, [800, 1200, 1600])).toEqual({
      src: `${BASE}f_auto,q_auto,c_limit,w_1600/${ASSET}`,
      srcSet: [
        `${BASE}f_auto,q_auto,c_limit,w_800/${ASSET} 800w`,
        `${BASE}f_auto,q_auto,c_limit,w_1200/${ASSET} 1200w`,
        `${BASE}f_auto,q_auto,c_limit,w_1600/${ASSET} 1600w`,
      ].join(", "),
    });
  });

  it("leaves a non-Cloudinary URL unchanged", () => {
    const url = "https://example.com/upload/photo.jpg";
    expect(limitImage(url, [800, 1600])).toEqual({ src: url });
  });

  it("leaves a Cloudinary URL that isn't an image upload unchanged", () => {
    const url = "https://res.cloudinary.com/dqdjr1d4f/video/upload/v1/clip.mp4";
    expect(limitImage(url, [800])).toEqual({ src: url });
  });
});
