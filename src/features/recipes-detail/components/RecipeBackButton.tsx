import { HistoryBackLink } from "@/components/HistoryBackLink";
import { ArrowLeft } from "lucide-react";

import { useRecipeBackDestination } from "../hooks/useRecipeBackDestination";

export function RecipeBackButton() {
  const { to, label } = useRecipeBackDestination();

  // History-back assumes the prior entry is `to`, which only holds while every from= source sets it to its own current location.
  return (
    <HistoryBackLink
      to={to}
      className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-background/90 px-4 py-2.25 text-sm font-semibold text-foreground backdrop-blur-xs md:top-5 md:left-5"
    >
      <ArrowLeft className="size-4" strokeWidth={2} />
      {label}
    </HistoryBackLink>
  );
}
