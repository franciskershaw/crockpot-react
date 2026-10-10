import { limitImage, type SizedImage } from "@/lib/cloudinary";

export type ResponsiveImage = SizedImage & { sizes?: string };

// Whole photos, never pre-cropped: each box crops with object-cover, so the
// card, the form preview and the hero all frame the same source the same way.
// The card shares the hero's 800/1200 files, which a phone usually picks for both.
const HERO_WIDTHS = [800, 1200, 1600];
const CARD_WIDTHS = [400, 800, 1200];

function responsive(
  url: string,
  widths: number[],
  sizes: string,
): ResponsiveImage {
  const image = limitImage(url, widths);
  return image.srcSet ? { ...image, sizes } : image;
}

export function recipeCardImage(url: string): ResponsiveImage {
  return responsive(
    url,
    CARD_WIDTHS,
    "(max-width: 767px) calc(100vw - 48px), 400px",
  );
}

export function recipeHeroImage(url: string): ResponsiveImage {
  return responsive(url, HERO_WIDTHS, "100vw");
}

export function recipePreviewImage(url: string): ResponsiveImage {
  return responsive(
    url,
    CARD_WIDTHS,
    "(min-width: 1024px) 380px, calc(100vw - 32px)",
  );
}
