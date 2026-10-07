import type { ReactNode } from "react";
import { CategoryIcon } from "@/features/catalog/components/CategoryIcon";

export function RegularsCategoryCard({
  categoryName,
  children,
}: {
  categoryName: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="min-w-0 rounded-[10px] border border-border bg-search-secondary">
      <legend className="float-left flex w-full items-center gap-2.5 px-3.5 pt-3 pb-1.5">
        <span className="flex size-6.5 shrink-0 items-center justify-center rounded-md border border-border bg-card text-ink-subtle">
          <CategoryIcon
            categoryName={categoryName}
            size={14}
            strokeWidth={1.9}
          />
        </span>
        <span className="font-display text-[17px] font-medium text-ink-secondary">
          {categoryName}
        </span>
      </legend>
      <div className="clear-left px-3.5 pb-1.5">{children}</div>
    </fieldset>
  );
}
