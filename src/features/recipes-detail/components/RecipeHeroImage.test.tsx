import {
  recipeCardImage,
  recipeHeroImage,
} from "@/features/recipes/utils/recipeImages";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RecipeHeroImage } from "./RecipeHeroImage";

const URL =
  "https://res.cloudinary.com/dqdjr1d4f/image/upload/v1/Crockpot/a.jpg";

function images(container: HTMLElement) {
  const [placeholder, full] = Array.from(container.querySelectorAll("img"));
  return { placeholder, full };
}

describe("RecipeHeroImage", () => {
  it("paints the card's already-loaded image from the first render", () => {
    const { container } = render(<RecipeHeroImage url={URL} />);
    const { placeholder } = images(container);
    const card = recipeCardImage(URL);

    expect(placeholder).toHaveAttribute("srcset", card.srcSet);
    expect(placeholder).toHaveAttribute("sizes", card.sizes);
    expect(placeholder).toHaveAttribute("decoding", "sync");
  });

  it("keeps the full image hidden until it loads, then shows it", () => {
    const { container } = render(<RecipeHeroImage url={URL} />);
    const { full } = images(container);

    expect(full).toHaveAttribute("srcset", recipeHeroImage(URL).srcSet);
    expect(full).toHaveClass("opacity-0");

    fireEvent.load(full);

    expect(full).toHaveClass("opacity-100");
    expect(full).not.toHaveClass("opacity-0");
  });
});
