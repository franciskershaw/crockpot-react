import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function EmptyTabPanel({
  icon: Icon,
  heading,
  description,
  action,
}: {
  icon: LucideIcon;
  heading: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[330px] flex-col items-center justify-center gap-3 rounded-[10px] border-[1.5px] border-dashed border-empty-border bg-empty-bg p-10 text-center">
      <Icon size={30} strokeWidth={1.6} className="text-separator-muted" />
      <h2 className="font-display text-[27px] font-medium text-foreground">
        {heading}
      </h2>
      <p className="max-w-[430px] text-base leading-[1.55] text-ink-body">
        {description}
      </p>
      {action}
    </div>
  );
}
