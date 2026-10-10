import { useState } from "react";
import {
  recipeCardImage,
  recipeHeroImage,
} from "@/features/recipes/utils/recipeImages";
import { cn } from "@/lib/utils";

const IMAGE_CLASSES = "absolute inset-0 size-full object-cover";

// The card's image is already decoded when arriving from browse, so it fills
// the hero on the first paint; same source and crop, so the full image sharpens it in place.
export function RecipeHeroImage({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <img
        {...recipeCardImage(url)}
        alt=""
        decoding="sync"
        className={IMAGE_CLASSES}
      />
      <img
        {...recipeHeroImage(url)}
        alt=""
        onLoad={() => setLoaded(true)}
        className={cn(
          IMAGE_CLASSES,
          "transition-opacity duration-150",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </>
  );
}
