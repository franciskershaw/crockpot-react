import { Clock } from "lucide-react";

export function RecipePendingApprovalBanner() {
  return (
    <div className="border-b border-category-chip-border bg-category-chip-bg px-6 py-3 text-category-chip-text">
      <div className="mx-auto flex max-w-7xl items-center gap-2 text-sm font-medium">
        <Clock size={16} strokeWidth={2} className="shrink-0" />
        Pending approval — visible only to you until an admin approves it
      </div>
    </div>
  );
}
