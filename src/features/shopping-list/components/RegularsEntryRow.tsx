import { ChevronRight, RotateCw } from "lucide-react";

export function RegularsEntryRow({
  count,
  onOpen,
}: {
  count: number | undefined;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full shrink-0 cursor-pointer items-center gap-3 border-b border-card-shadow px-4.5 py-3.75 text-left"
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-chip text-ink-subtle">
        <RotateCw size={14} strokeWidth={2.2} />
      </span>
      <span className="flex-1 text-base font-semibold">Regulars</span>
      {count !== undefined && (
        <span className="text-[13px] text-icon-muted tabular-nums">
          {count > 0 ? `${count} saved` : "None yet"}
        </span>
      )}
      <ChevronRight size={16} strokeWidth={2} className="text-ink-subtle" />
    </button>
  );
}
