import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useRecipeBackDestination } from "../hooks/useRecipeBackDestination";

export function RecipeBackButton() {
  const navigate = useNavigate();
  const { to, label, canGoBack } = useRecipeBackDestination();

  // Real history-back when we know there's a prior entry (restores scroll/filters
  // for free), else falls through to <Link>; assumes that entry is `to`, which only holds while every from= source sets it to its own current location.
  const handleClick = (event: React.MouseEvent) => {
    if (!canGoBack) return;
    event.preventDefault();
    navigate(-1);
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-background/90 px-4 py-2.25 text-sm font-semibold text-foreground backdrop-blur-xs md:top-5 md:left-5"
    >
      <ArrowLeft className="size-4" strokeWidth={2} />
      {label}
    </Link>
  );
}
