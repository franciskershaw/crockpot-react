import type { ReactNode } from "react";

// Columns follow the grid's own width, beside the filter sidebar from md up.
export function ResponsiveRecipeGrid({ children }: { children: ReactNode }) {
  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-6 @min-[35rem]:grid-cols-2 @min-[52rem]:grid-cols-3">
        {children}
      </div>
    </div>
  );
}
