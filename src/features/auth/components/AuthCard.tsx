import type { ReactNode } from "react";

// Full-width on mobile; a bordered card from md up.
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 justify-center px-5 py-6 md:px-6 md:py-16">
      <section className="w-full md:max-w-110 md:self-start md:rounded-xl md:border md:border-input md:bg-card md:px-11 md:py-10 md:shadow-[0_2px_0_var(--card-shadow)]">
        {title && (
          <header className="mb-7">
            <h1 className="font-display text-[26px] leading-tight font-medium md:text-[30px]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-[15px] text-ink-body">{subtitle}</p>
            )}
          </header>
        )}
        {children}
      </section>
    </div>
  );
}
