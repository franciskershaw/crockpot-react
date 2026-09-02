import { Link } from "react-router-dom";

export function RecipesComingSoon() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-4xl">Recipes are coming soon</h1>
      <p className="max-w-md text-muted-foreground">
        Browse and search aren't ready yet. Check back shortly.
      </p>
      <Link to="/" className="underline underline-offset-4">
        Back to home
      </Link>
    </div>
  );
}
