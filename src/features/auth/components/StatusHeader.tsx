import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// Badge, title and explanation for the auth screens that show a state rather than a form.
export function StatusHeader({
  icon: Icon,
  tone = "neutral",
  title,
  children,
}: {
  icon: LucideIcon;
  tone?: "neutral" | "error";
  title: string;
  children?: ReactNode;
}) {
  return (
    <>
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-full md:size-13",
          tone === "error"
            ? "bg-error-banner-bg text-field-error"
            : "bg-chip text-green",
        )}
      >
        <Icon
          aria-hidden="true"
          className="size-5.5 md:size-6"
          strokeWidth={2}
        />
      </span>
      <h1 className="mt-4 font-display text-[26px] leading-tight font-medium md:text-[30px]">
        {title}
      </h1>
      {children && (
        <p className="mt-1.5 text-[15px] text-ink-body">{children}</p>
      )}
    </>
  );
}
