import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function RecipeFormFooter({
  status,
  submitLabel,
  onSubmit,
}: {
  status: ReactNode;
  submitLabel: string;
  onSubmit: () => void;
}) {
  return (
    <footer className="sticky bottom-0 z-30 border-t border-slider-track bg-card shadow-[0_-8px_24px_rgba(35,32,27,0.06)]">
      <div className="flex flex-col gap-2.5 px-5 py-3 md:flex-row md:items-center md:justify-between md:gap-6 md:px-10 md:py-4">
        {status}
        <Button
          type="button"
          onClick={onSubmit}
          className="h-11 w-full rounded-lg px-7 text-[15px] font-bold md:h-11.5 md:w-auto"
        >
          {submitLabel}
        </Button>
      </div>
    </footer>
  );
}
