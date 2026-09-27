import { useState } from "react";
import { BottomSheet } from "@/components/BottomSheet";
import { ShoppingCart } from "lucide-react";

import { useShoppingList } from "../hooks/useShoppingList";
import { ShoppingListPanel } from "./ShoppingListPanel";

export function ShoppingListSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useShoppingList();
  const remaining = data?.items.filter((item) => !item.obtained).length ?? 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={
          remaining > 0
            ? `Open shopping list, ${remaining} left to buy`
            : "Open shopping list"
        }
        className="fixed right-4 bottom-20 z-30 flex size-14 cursor-pointer items-center justify-center rounded-full bg-green text-on-dark shadow-fab md:hidden"
      >
        <ShoppingCart size={22} strokeWidth={2} />
        {remaining > 0 && (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 flex h-5.5 min-w-5.5 items-center justify-center rounded-full border-2 border-background bg-accent-rust px-1 text-[11px] font-bold text-on-dark tabular-nums"
          >
            {remaining}
          </span>
        )}
      </button>
      <BottomSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Shopping list"
        description="Everything you need to buy for the recipes on your menu."
      >
        <ShoppingListPanel
          className="min-h-0 rounded-none border-0 shadow-none"
          onClose={() => setIsOpen(false)}
        />
      </BottomSheet>
    </>
  );
}
