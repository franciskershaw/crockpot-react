import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { useRecipeBackDestination } from "../hooks/useRecipeBackDestination";

export function RecipeBackButton() {
  const { to, label } = useRecipeBackDestination();

  return (
    <>
      <Link
        to={to}
        aria-label={label}
        className="absolute top-4 left-4 z-10 flex size-9 items-center justify-center rounded-full bg-background/90 backdrop-blur-xs md:hidden"
      >
        <ArrowLeft className="size-4" strokeWidth={2.2} />
      </Link>

      <Link
        to={to}
        className="absolute top-5 left-5 z-10 hidden items-center gap-2 rounded-full bg-background/90 px-4 py-2.25 text-sm font-semibold text-foreground backdrop-blur-xs md:flex"
      >
        <ArrowLeft className="size-4" strokeWidth={2} />
        {label}
      </Link>
    </>
  );
}
