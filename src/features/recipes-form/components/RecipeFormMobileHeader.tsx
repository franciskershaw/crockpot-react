import { HistoryBackLink } from "@/components/HistoryBackLink";
import { ArrowLeft } from "lucide-react";

export function RecipeFormMobileHeader({
  title,
  fallbackTo,
}: {
  title: string;
  fallbackTo: string;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-13.5 items-center gap-3 border-b border-slider-track bg-card px-4 md:hidden">
      <HistoryBackLink
        to={fallbackTo}
        aria-label="Back"
        className="-ml-1 flex size-9 items-center justify-center rounded-full text-foreground"
      >
        <ArrowLeft className="size-5" strokeWidth={2} />
      </HistoryBackLink>
      <h1 className="font-display text-xl font-medium">{title}</h1>
    </header>
  );
}
