import { useId, type ReactNode } from "react";

export function AccountCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className="rounded-xl border border-input bg-card p-5 shadow-[0_2px_0_var(--card-shadow)] md:px-8 md:py-7"
    >
      <h2
        id={titleId}
        className="mb-3.5 text-base font-bold md:mb-4 md:text-lg"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
