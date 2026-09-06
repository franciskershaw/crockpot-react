import { ChefHat } from "lucide-react";

export function RouteFallback() {
  return (
    <output
      aria-live="polite"
      className="flex flex-1 items-center justify-center py-24"
    >
      <ChefHat
        aria-hidden="true"
        className="animate-spin-slow size-10 text-muted-foreground motion-reduce:animate-none"
      />
      <span className="sr-only">Loading…</span>
    </output>
  );
}
