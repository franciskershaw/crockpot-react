import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CircleAlert, CircleCheck } from "lucide-react";

export function FormBanner({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: ReactNode;
}) {
  const Icon = tone === "error" ? CircleAlert : CircleCheck;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3.25 py-2.75 text-[13px] md:px-3.5 md:py-3 md:text-sm",
        tone === "error"
          ? "border-error-banner-border bg-error-banner-bg text-error-banner-text"
          : "border-success-banner-border bg-success-banner-bg text-success-banner-text",
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "mt-0.5 size-4.5 shrink-0",
          tone === "error" ? "text-field-error" : "text-green",
        )}
      />
      <p>{children}</p>
    </div>
  );
}
