import { cn } from "@/lib/utils";

function hintText(count: number, max: number, noun: string, emptyHint: string) {
  if (count === 0) return emptyHint;
  if (count <= max) return `${count} of ${max} ${noun}`;
  return `${count} ${noun}. Remove ${count - max} to publish.`;
}

export function CountHint({
  count,
  max,
  noun,
  emptyHint,
}: {
  count: number;
  max: number;
  noun: string;
  emptyHint: string;
}) {
  return (
    <p
      aria-live="polite"
      className={cn(
        "mt-3 text-[13px]",
        count > max ? "font-semibold text-rust-text" : "text-placeholder",
      )}
    >
      {hintText(count, max, noun, emptyHint)}
    </p>
  );
}
