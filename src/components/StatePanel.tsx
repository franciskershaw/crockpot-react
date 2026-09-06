import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function StatePanel({
  icon: Icon,
  heading,
  description,
  actions,
}: {
  icon: LucideIcon;
  heading: string;
  description: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Icon className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="font-display text-2xl">{heading}</h2>
        <p className="max-w-md text-muted-foreground">{description}</p>
      </div>
      {actions}
    </div>
  );
}
