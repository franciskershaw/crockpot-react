import { ChefHat } from "lucide-react";

export function EmptyMenuPanel() {
  return (
    <div className="flex min-h-[330px] flex-col items-center justify-center gap-3 rounded-[10px] border-[1.5px] border-dashed border-empty-border bg-empty-bg p-10 text-center">
      <ChefHat size={30} strokeWidth={1.6} className="text-separator-muted" />
      <h2 className="font-display text-[27px] font-medium text-foreground">
        Nothing on the menu yet
      </h2>
      <p className="max-w-[430px] text-base leading-[1.55] text-ink-body">
        Tap the basket on any recipe you fancy and it lands here. Your shopping
        list builds itself from whatever you add.
      </p>
    </div>
  );
}
