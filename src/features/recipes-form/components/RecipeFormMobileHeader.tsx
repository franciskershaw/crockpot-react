import { canGoBackInApp } from "@/features/recipes-detail/hooks/useRecipeBackDestination";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export function RecipeFormMobileHeader({
  title,
  fallbackTo,
}: {
  title: string;
  fallbackTo: string;
}) {
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent) => {
    if (!canGoBackInApp()) return;
    event.preventDefault();
    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-40 flex h-13.5 items-center gap-3 border-b border-slider-track bg-card px-4 md:hidden">
      <Link
        to={fallbackTo}
        onClick={handleClick}
        aria-label="Back"
        className="-ml-1 flex size-9 items-center justify-center rounded-full text-foreground"
      >
        <ArrowLeft className="size-5" strokeWidth={2} />
      </Link>
      <h1 className="font-display text-xl font-medium">{title}</h1>
    </header>
  );
}
