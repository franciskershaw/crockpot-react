import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AccountCard({
  title,
  icon,
  tone = "default",
  children,
}: {
  title: string;
  icon?: ReactNode;
  tone?: "default" | "danger";
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "rounded-xl border p-5 md:px-8 md:py-7",
        tone === "danger"
          ? "border-error-banner-border bg-danger-card-bg text-error-banner-text"
          : "border-input bg-card shadow-[0_2px_0_var(--card-shadow)]",
      )}
    >
      <h2
        id={titleId}
        className="mb-3.5 flex items-center gap-2 text-base font-bold md:mb-4 md:text-lg"
      >
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}
