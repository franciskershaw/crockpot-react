import { Link } from "react-router-dom";

import { RecipeCard } from "./RecipeCard";
import type { RecipeCard as RecipeCardData } from "./types";

// TEMPORARY — remove once the real grid replaces this page.
const PREVIEW_CARDS: RecipeCardData[] = [
  {
    id: "preview-1",
    name: "BBQ Pulled Pork With All The Trimmings",
    imageUrl: "https://picsum.photos/seed/crockpot-1/600/450",
    imageFilename: null,
    timeInMinutes: 320,
    serves: 12,
    approved: true,
    categories: [{ id: "cat-1", name: "Batch" }],
    createdAt: "2026-01-01T00:00:00.000Z",
    isFavourite: false,
  },
  {
    id: "preview-2",
    name: "Chicken Fajita Wraps",
    imageUrl: "https://picsum.photos/seed/crockpot-2/600/450",
    imageFilename: null,
    timeInMinutes: 35,
    serves: 4,
    approved: true,
    categories: [
      { id: "cat-2", name: "Speedy" },
      { id: "cat-3", name: "Group" },
      { id: "cat-4", name: "Weeknight" },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    isFavourite: true,
  },
  {
    id: "preview-3",
    name: "Untitled Draft Recipe",
    imageUrl: null,
    imageFilename: null,
    timeInMinutes: 20,
    serves: 2,
    approved: false,
    categories: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    isFavourite: false,
  },
];

function RecipeCardPreview() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <p className="mb-4 text-center text-sm text-muted-foreground">
        Temporary RecipeCard preview — remove once the real grid ships.
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {PREVIEW_CARDS.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}

export function RecipesComingSoon() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-8">
      <h1 className="font-display text-4xl">Recipes are coming soon</h1>
      <p className="max-w-md text-muted-foreground">
        Browse and search aren't ready yet. Check back shortly.
      </p>
      <Link to="/" className="underline underline-offset-4">
        Back to home
      </Link>
      <RecipeCardPreview />
    </div>
  );
}
