import { fillImage } from "@/lib/cloudinary";

import { type ShowcaseRecipe } from "../utils/showcaseRecipes";

export function ShowcaseRecipeCard({
  recipe,
  className,
}: {
  recipe: ShowcaseRecipe;
  className?: string;
}) {
  return (
    <div
      className={`w-72 rounded-xl bg-card p-3 shadow-lg ring-1 ring-border/50 ${className ?? ""}`}
    >
      <img
        {...fillImage(recipe.imageUrl, 264, 198)}
        alt={recipe.name}
        loading="lazy"
        className="aspect-4/3 w-full rounded-lg bg-muted object-cover"
      />
      <p className="mt-3 truncate font-display">{recipe.name}</p>
      <p className="text-sm text-muted-foreground">
        {recipe.timeInMinutes} mins · serves {recipe.serves}
      </p>
    </div>
  );
}
