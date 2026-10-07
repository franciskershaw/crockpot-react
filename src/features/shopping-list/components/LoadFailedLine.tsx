import { cn } from "@/lib/utils";

export function LoadFailedLine({
  what,
  onRetry,
  className,
}: {
  what: string;
  onRetry: () => void;
  className?: string;
}) {
  return (
    <p className={cn("px-4.5 py-6 text-sm text-ink-subtle", className)}>
      <span>Couldn't load your {what}.</span>{" "}
      <button
        type="button"
        onClick={onRetry}
        className="cursor-pointer font-semibold text-green"
      >
        Retry
      </button>
    </p>
  );
}
