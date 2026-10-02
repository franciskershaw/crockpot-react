import type { ReactNode } from "react";

export function FormSection({
  title,
  action,
  children,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-[10px] border border-border bg-card p-4.5 md:p-6.5">
      {title && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-medium md:text-2xl">
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
