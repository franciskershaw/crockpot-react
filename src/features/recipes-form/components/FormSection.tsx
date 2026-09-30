import type { ReactNode } from "react";

export function FormSection({
  title,
  children,
}: {
  title?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-[10px] border border-border bg-card p-4.5 md:p-6.5">
      {title && (
        <h2 className="mb-4 font-display text-xl font-medium md:text-2xl">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
